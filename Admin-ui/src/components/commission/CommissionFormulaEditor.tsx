import React, { useState, useMemo, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import Button from '@/components/ui/button';
import { commissionService } from "@/services/commissionService";

/* ===========================
   Parser Helpers
=========================== */

function isAlphaNumeric(ch) {
  return /[A-Za-z0-9_\.]/.test(ch);
}

function isWhitespace(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

const COMPARISON_OPERATORS = [">", "<", ">=", "<=", "==", "!="];
const IDENTIFIER_REGEX = /\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\b/g;

/* ===========================
   Operator Helpers
=========================== */

const OPERATORS = ["&&", "||", ">=", "<=", "==", "!=", "+", "-", "*", "/", ">", "<", "=", "^", "?", "%"];

function matchOperator(str, index) {
  return OPERATORS.find(op => str.startsWith(op, index));
}

/* ===========================
   Formula Parser
=========================== */

function parseFormula(str) {
  let i = 0;
  const len = str.length;

  function peek() { return str[i]; }
  function next() { return str[i++]; }
  function eof() { return i >= len; }
  function skipWhitespace() { while (!eof() && isWhitespace(peek())) i++; }

  function parsePrimary() {
    if (peek() === "!") {
      next();
      return {
        type: "unary",
        operator: "!",
        argument: parsePrimary(),
      };
    }

    skipWhitespace();
    if (eof()) return null;
    const ch = peek();

    if (ch === "(") {
      next();
      const inner = parseExpression();
      skipWhitespace();
      if (peek() === ")") next();
      return { type: "group", children: [inner] };
    }

    if (/[A-Za-z_]/.test(ch)) {
      let ident = "";
      while (!eof() && isAlphaNumeric(peek())) ident += next();
      skipWhitespace();

      if (peek() === "(") {
        next();
        const args = [];
        if (peek() === ")") { next(); return { type: "function", name: ident, args }; }
        while (!eof()) {
          args.push(parseExpression());
          skipWhitespace();
          if (peek() === ",") next();
          else if (peek() === ")") { next(); break; }
        }
        return { type: "function", name: ident, args };
      }

      if (["TRUE", "FALSE"].includes(ident.toUpperCase()))
        return { type: "boolean", value: ident.toUpperCase() === "TRUE" };

      if (peek() === ":") {
        next();
        let right = "";
        while (!eof() && isAlphaNumeric(peek())) right += next();
        return { type: "range", value: ident + ":" + right };
      }

      return { type: "identifier", value: ident };
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(str[i + 1]))) {
      let num = "";
      while (!eof() && /[0-9\.]/.test(peek())) num += next();
      return { type: "number", value: parseFloat(num) };
    }

    return { type: "unknown", value: next() };
  }

  function parseExpression() {
    const nodes = [];
    while (!eof()) {
      skipWhitespace();
      if (peek() === ")" || peek() === ",") break;

      const prim = parsePrimary();
      if (prim) nodes.push(prim);

      skipWhitespace();
      const op = matchOperator(str, i);
      if (op) {
        i += op.length;
        nodes.push({ type: "operator", value: op });
      }
    }
    if (nodes.length === 1) return nodes[0];
    return { type: "sequence", children: nodes };
  }

  skipWhitespace();
  if (peek() === "=") next();
  return parseExpression();
}

/* ===========================
   RenderTree Component
=========================== */

function RenderTree({ node }) {
  if (!node) return null;

  if (["number", "string", "identifier", "boolean", "range"].includes(node.type)) {
    return (
      <span className="px-2 py-0.5 rounded border text-sm bg-gray-100 dark:bg-gray-300" style={{ backgroundColor: '#798699ff' }}>
        {node.type === "string" ? `"${node.value}"` : node.value}
      </span>
    );
  }

  if (node.type === "operator") {
    return <span className="mx-1 font-bold text-black">{node.value}</span>;
  }

  if (node.type === "unary") {
    return (
      <span className="flex items-center gap-1">
        <span className="font-bold">!</span>
        <RenderTree node={node.argument} />
      </span>
    );
  }

  if (node.type === "sequence") {
    return (
      <div className="flex flex-wrap gap-1">
        {node.children.map((c, i) => <RenderTree key={i} node={c} />)}
      </div>
    );
  }

  if (node.type === "group") {
    return <div className="pl-4 border-l">{node.children.map((c, i) => <RenderTree key={i} node={c} />)}</div>;
  }

  if (node.type === "function") {
    return (
      <div className="pl-4 border-l-2 border-gray-300 space-y-2">
        <div className="font-bold text-indigo-600">{node.name.toUpperCase()}</div>
        <div className="flex gap-2">
          <span className="font-semibold text-gray-500 w-28">Condition:</span>
          <RenderTree node={node.args[0]} />
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-green-600 w-28">When true:</span>
          <RenderTree node={node.args[1]} />
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-purple-600 w-28">When false:</span>
          <RenderTree node={node.args[2]} />
        </div>
      </div>
    );
  }

  return null;
}

/* ===========================
   CommissionFormulaEditor Component
=========================== */

interface CommissionFormulaEditorProps {
  commissionConfigId: number;
  onSaveSuccess: () => void;
  initialFormula?: string;
}

export default function CommissionFormulaEditor({ 
  commissionConfigId, 
  onSaveSuccess,
  initialFormula = '=IF(policy.pt > 1000, "High Value", "Standard")'
}: CommissionFormulaEditorProps) {
  const [formula, setFormula] = useState(initialFormula);
  const [showLeftParsed, setShowLeftParsed] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editorRef = useRef(null);

  // Available fields for commission formulas
  const fields = [
    { name: "pt", description: "Number - Policy Threshold" },
    { name: "name", description: "Text - Policy Holder Name" },
    { name: "startDate", description: "Date - Policy Start Date" },
    { name: "endDate", description: "Date - Policy End Date" },
    { name: "premium", description: "Number - Premium Amount" },
    { name: "sumAssured", description: "Number - Sum Assured" },
  ];

  const objects = {
    policy: [
      { name: "pt", description: "Number - Policy Threshold", dataType: 'number' },
      { name: "name", description: "Text - Policy Holder Name", dataType: 'string' },
      { name: "startDate", description: "Date - Policy Start Date", dataType: 'date' },
      { name: "endDate", description: "Date - Policy End Date", dataType: 'date' },
      { name: "product", description: "String - Policy Product", dataType: 'string' },
      { name: "UIN", description: "String - Policy UIN", dataType: 'string' },
      { name: "premium", description: "Number - Premium Amount", dataType: 'number' },
      { name: "sumAssured", description: "Number - Sum Assured", dataType: 'number' },
    ],
    customer: [
      { name: "firstName", description: "Text - Customer First Name", dataType: 'string' },
      { name: "lastName", description: "Text - Customer Last Name", dataType: 'string' },
      { name: "dob", description: "Date - Date of Birth", dataType: 'date' },
      { name: "age", description: "Number - Customer Age", dataType: 'number' },
    ],
    commission: [
      { name: "rate", description: "Number - Commission Rate", dataType: 'number' },
      { name: "amount", description: "Number - Commission Amount", dataType: 'number' },
      { name: "type", description: "String - Commission Type", dataType: 'string' },
    ],
  };

  const { ast } = useMemo(() => ({ ast: parseFormula(formula) }), [formula]);

  const filteredFields = fields.filter(f =>
    (`policy.${f.name}`).toLowerCase().includes(search.toLowerCase())
  );

  const insertAtCursor = (text) => {
    const editor = editorRef.current;
    if (!editor) return;

    const position = editor.getPosition();

    editor.executeEdits("", [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  };

  function indexToPosition(model, index) {
    const textBefore = model.getValue().slice(0, index);
    const lines = textBefore.split("\n");

    return {
      lineNumber: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  function inferLiteralType(value) {
    if (/^".*"$/.test(value)) return "string";
    if (/^\d+(\.\d+)?$/.test(value)) return "number";
    return null;
  }

  function validateFormulaIdentifiers(formula, objects) {
    const errors = [];
    const IDENTIFIER_REGEX = /\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\b/g;
    const COMPARISON_REGEX =
      /\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*(".*?"|\d+(\.\d+)?)/g;

    let match;

    // Object / Property check
    while ((match = IDENTIFIER_REGEX.exec(formula)) !== null) {
      const [full, objectName, propertyName] = match;
      const startIndex = match.index;

      if (!objects[objectName]) {
        errors.push({
          message: `Unknown object '${objectName}'`,
          start: startIndex,
          end: startIndex + objectName.length,
        });
        continue;
      }

      const field = objects[objectName].find(f => f.name === propertyName);
      if (!field) {
        errors.push({
          message: `Property '${propertyName}' does not exist on '${objectName}'`,
          start: startIndex + objectName.length + 1,
          end: startIndex + full.length,
        });
      }
    }

    // Type mismatch check
    while ((match = COMPARISON_REGEX.exec(formula)) !== null) {
      const [full, objectName, propertyName, operator, literal] = match;
      const startIndex = match.index;

      if (!objects[objectName]) continue;

      const field = objects[objectName].find(f => f.name === propertyName);
      if (!field || !field.dataType) continue;

      const literalType = inferLiteralType(literal);
      if (!literalType) continue;

      if (field.dataType !== literalType) {
        errors.push({
          message: `Cannot compare ${field.dataType} with ${literalType}`,
          start: startIndex,
          end: startIndex + full.length,
        });
      }
    }

    return errors;
  }

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setError(null);

//       // Validate the formula
//       const errors = validateFormulaIdentifiers(formula, objects);
//       if (errors.length > 0) {
//         setError(`Formula validation error: ${errors[0].message}`);
//         return;
//       }

//       // Prepare payload for API
//       const payload = {
//         commissionConfigId,
//         formula,
//         createdAt: new Date().toISOString(),
//       };

//       // Call your API service here
//       // const response = await commissionService.saveCommissionFormula(payload);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       console.log("Saving formula:", payload);
      
//       // If successful, move to next step
//       onSaveSuccess();
//     } catch (err) {
//       console.error(err);
//       setError("Failed to save commission formula");
//     } finally {
//       setSaving(false);
//     }
//   };


const handleSave = async () => {
  try {
    setSaving(true);
    setError(null);

    // Validate the formula
    const errors = validateFormulaIdentifiers(formula, objects);
    if (errors.length > 0) {
      setError(`Formula validation error: ${errors[0].message}`);
      return;
    }

    // Call the updateConditionCommissionConfig API
    const response = await commissionService.updateConditionCommissionConfig({
      commissionConfigId,
      condition: formula
    });
    
    console.log("Updated condition:", response);
    
    // If successful, move to next step
     if (response && response.success) {
      console.log("Updated condition:", response);
      onSaveSuccess();
    } else { 
            const errorMessage = response?.message || "Failed to update commission condition";
      setError(errorMessage);
      console.error("API error:", response);
    }

  } catch (err) {
    console.error(err);
    setError("Failed to update commission condition");
  } finally {
    setSaving(false);
  }
};
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    const model = editor.getModel();

    // Autocomplete setup
    monaco.languages.registerCompletionItemProvider("plaintext", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        let suggestions = [];

        const match = textUntilPosition.match(/([A-Za-z0-9_]+)\.([A-Za-z0-9_]*)$/);
        if (match) {
          const objectName = match[1];
          const typedField = match[2];

          if (objects[objectName]) {
            suggestions = objects[objectName]
              .filter(f => f.name.startsWith(typedField))
              .map(f => ({
                label: f.name,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: f.name,
                detail: f.description,
              }));
          }
        } else {
          const genericMatch = textUntilPosition.match(/([A-Za-z0-9_]*)$/);
          const prefix = genericMatch ? genericMatch[1] : "";

          suggestions = fields
            .filter(f => ("policy." + f.name).startsWith(prefix))
            .map(f => ({
              label: `policy.${f.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `policy.${f.name}`,
              detail: f.description,
            }));
        }

        return { suggestions };
      }
    });

    // Validation setup
    const runValidation = () => {
      const value = model.getValue();
      const errors = validateFormulaIdentifiers(value, objects);

      const markers = errors.map(err => {
        const start = indexToPosition(model, err.start);
        const end = indexToPosition(model, err.end);

        return {
          severity: monaco.MarkerSeverity.Error,
          message: err.message,
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column,
        };
      });

      monaco.editor.setModelMarkers(model, "formula-validation", markers);
    };

    editor.onDidChangeModelContent(runValidation);
    runValidation();
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <header className="border-b bg-primary text-white py-4 shadow-lg flex-shrink-0">
        <div className="pl-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Commission Formula Editor</h1>
          <div className="flex gap-4 pr-5">
            <span 
              className="material-icons cursor-pointer" 
              onClick={() => setShowLeftParsed(!showLeftParsed)}
            >
              settings
            </span>
            <span className="material-icons cursor-pointer">help_outline</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-5 overflow-hidden">
        {/* Error Display */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formula Editor */}
        <section className="w-full bg-white rounded-xl shadow border p-4 mb-4 flex-shrink-0">
          <MonacoEditor
            height="80px"
            defaultLanguage="plaintext"
            value={formula}
            onChange={setFormula}
            onMount={handleEditorDidMount}
            options={{
              fontFamily: "monospace",
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </section>

        {/* Save Button */}
        <div className="flex justify-end mb-4 flex-shrink-0">
          <Button 
            onClick={handleSave}
            disabled={saving}
            variant="orange"
            size="lg"
          >
            {saving ? 'Saving...' : 'Save Formula & Continue'}
          </Button>
        </div>

        <div className={`flex-1 ${showLeftParsed ? "flex gap-4" : ""} overflow-hidden`}>
          {showLeftParsed && (
            <section className="w-1/2 bg-white rounded-xl shadow border p-4 overflow-hidden flex flex-col">
              <input
                type="text"
                placeholder="Search policy fields..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded text-sm text-gray-700 flex-shrink-0"
              />

              <div className="flex-1 overflow-y-auto space-y-2">
                {search.trim() !== "" && filteredFields.map((f) => (
                  <div
                    key={f.name}
                    onClick={() => insertAtCursor(`policy.${f.name}`)}
                    className="cursor-pointer px-3 py-2 rounded bg-gray-100 hover:bg-indigo-100 text-sm"
                  >
                    <div className="font-mono text-indigo-700">
                      policy.{f.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {f.description}
                    </div>
                  </div>
                ))}

                {search.trim() !== "" && filteredFields.length === 0 && (
                  <div className="text-sm text-gray-400">
                    No matching fields
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={`${showLeftParsed ? "w-1/2" : "w-full"} bg-white rounded-xl shadow border p-6 overflow-hidden flex flex-col`}>
            <h2 className="text-black font-semibold mb-4 flex items-center gap-2 flex-shrink-0">
              <span className="material-icons text-indigo-500">account_tree</span>
              Parsed Structure
            </h2>

            <div className="flex-1 overflow-y-auto font-mono text-sm">
              <RenderTree node={ast} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}