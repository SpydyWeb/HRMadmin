import React, { useState, useMemo, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import Button from '@/components/ui/button';
import { commissionService } from "@/services/commissionService";
import { IoIosSettings } from "react-icons/io";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { showToast } from '@/components/ui/sonner';
import { NOTIFICATION_CONSTANTS } from '@/utils/constant';


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

interface CommissionFormulaEditorFilterProps {
  // commissionConfigId?: number | null;
  onSaveSuccess?: () => void;
  initialFormula?: string;
  condition?: string;
  onFormulaChange?: (formula: string) => void;
}

export default function CommissionFormulaEditorFilter({ 
  // commissionConfigId, 
  onSaveSuccess,
  initialFormula = '=IF(policy.pt > 1000, "High Value", "Standard")',
  onFormulaChange
}: CommissionFormulaEditorFilterProps) {
  // Initialize state with initialFormula prop value (empty string is valid)
  // Only use default if initialFormula is actually undefined (not just empty string)
  // const getInitialValue = () => {
  //   return initialFormula !== undefined ? initialFormula : '=IF(policy.pt > 1000, "High Value", "Standard")';
  // };
  const getInitialValue = () => {
    return initialFormula !== undefined ? initialFormula : '';
  };
  const [formula, setFormula] = useState(getInitialValue());
  const [showLeftParsed, setShowLeftParsed] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const[loadingFields, setLoadingFields] = useState(true);

  // State for API data, loading, and errors
  const [objects, setObjects] = useState<Record<string, Array<{ propertyName: string; columnName:string; description: string; dataType?: string }>>>({});
  // const [fields, setFields] = useState([]);

  const editorRef = useRef<any>(null);
  const objectsRef = useRef<Record<string, Array<{ propertyName: string; columnName:string; description: string; dataType?: string }>>>({});
  const prevInitialFormulaRef = useRef<string | undefined>(initialFormula);
  const formulaRef = useRef<string>(getInitialValue());
  
  // Keep ref in sync with state
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  // Available fields for commission formulas
  const fields = [
    { name: "pt", description: "Number - Policy Threshold" },
    { name: "name", description: "Text - Policy Holder Name" },
    { name: "startDate", description: "Date - Policy Start Date" },
    { name: "endDate", description: "Date - Policy End Date" },
    { name: "premium", description: "Number - Premium Amount" },
    { name: "sumAssured", description: "Number - Sum Assured" },
{name: 'lastName', description: 'Text - Customer Last Name'},
{name: 'dob', description: 'Date - Date of Birth'}
  ];

  // Call API - commissionSearchFields and use response as Objects
  useEffect(() => {
    const fetchSearchFields = async () => {
      try {
        setLoadingFields(true);
        const response = await commissionService.commissionSearchFields({} as any);
        console.log("opimnj", response);
        
        if (response?.responseHeader?.errorMessage === "SUCCESS" && response?.responseHeader?.errorCode === 1101) {
          let responseData: any = response.responseBody?.metaDataResponse;
          
          // Handle case where metaDataResponse is an array (take first element) or an object
          if (Array.isArray(responseData)) {
            console.log("metaDataResponse is an array, length:", responseData.length);
            if (responseData.length > 0) {
              responseData = responseData[0]; // Take first element if array
            } else {
              responseData = {};
            }
          }

          // Ensure the data structure is correct - all values should be arrays
          const processedData: Record<string, any> = {};
          if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
            Object.keys(responseData).forEach(key => {
              const value = responseData[key];
              if (Array.isArray(value)) {
                processedData[key] = value;
              } else {
                console.warn(`Key ${key} is not an array, value:`, value);
                processedData[key] = [];
              }
            });
          }
 
          setObjects(processedData);
        } else {
          // Fallback to default structure if response doesn't match expected format
          setObjects({
            agent: [],
            commrate: [],
            insured: [],
            owner: [],
            customer: [],
            premium: [],
            policy: [],
          });
        }
        } catch (err) {
        console.error("Error fetching commission search fields:", err);
        // Fallback to default structure on error
        setObjects({
          agent: [],
          commrate: [],
          insured: [],
          owner: [],
          customer: [],
          premium: [],
          policy: [],
        });
        showToast(NOTIFICATION_CONSTANTS.ERROR, 'Failed to load fields', {
          description: 'Using default field structure'
        });
      } finally {
        setLoadingFields(false);
      }
    };

   
      fetchSearchFields();
    
  }, []);


  console.log("myobjects", objects);

  useEffect(() => {
    // Only update if initialFormula prop actually changed (not just a re-render)
    // This prevents resetting the editor when user is typing
    if (prevInitialFormulaRef.current !== initialFormula) {
      const newFormula = initialFormula !== undefined ? initialFormula : '';
      const currentFormula = formulaRef.current; // Use ref to avoid stale closure
      
      // Only update if the new formula is different from current
      // This prevents resetting when the prop hasn't meaningfully changed
      if (newFormula !== currentFormula) {
        prevInitialFormulaRef.current = initialFormula;
        setFormula(newFormula);
        formulaRef.current = newFormula; // Update ref
        
        const updateEditor = () => {
          const editor = editorRef.current;
          if (editor && typeof editor.getValue === 'function' && typeof editor.setValue === 'function') {
            const editorValue = editor.getValue();
            // Only update editor if values are actually different
            if (editorValue !== newFormula) {
              editor.setValue(newFormula);
            }
          }
        };
        
        updateEditor();
        setTimeout(updateEditor, 100);
      } else {
        // Update ref even if we don't update state, to prevent unnecessary checks
        prevInitialFormulaRef.current = initialFormula;
      }
    }
  }, [initialFormula]); // Only depend on initialFormula prop, not internal formula state
  
  const { ast } = useMemo(() => ({ ast: parseFormula(formula) }), [formula]);

  // Create a flattened list of all fields from all objects with their object prefix
  const allFields = useMemo(() => {
    const fieldsList: Array<{
      objectKey: string;
      propertyName: string;
      description: string;
      dataType?: string;
      fullPath: string;
    }> = [];
    Object.keys(objects).forEach(objectKey => {
      if (Array.isArray(objects[objectKey])) {
        objects[objectKey].forEach(field => {
          const propertyName = field.propertyName;
          fieldsList.push({
            objectKey,
            propertyName: propertyName,
            description: field.description,
            dataType: field.dataType,
            fullPath: `${objectKey}.${propertyName}`
          });
        });
      }
    });
    return fieldsList;
  }, [objects]);

  // Filter fields based on search term (searches across all object.field combinations)
  // When search is empty, show all fields; otherwise filter by search term
  const filteredFields = useMemo(() => {
    if (!search.trim()) {
      // Show all fields when search is empty
      return allFields;
    }
    const searchLower = search.toLowerCase();
    return allFields.filter(f =>
      f.fullPath.toLowerCase().includes(searchLower) ||
      f.description?.toLowerCase().includes(searchLower) ||
      f.propertyName.toLowerCase().includes(searchLower) ||
      f.objectKey.toLowerCase().includes(searchLower)
    );
  }, [allFields, search]);

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

      // Case-insensitive object name lookup
      const objectKey = Object.keys(objects).find(key => key.toLowerCase() === objectName.toLowerCase());
      if (!objectKey) {
        errors.push({
          message: `Unknown object '${objectName}'`,
          start: startIndex,
          end: startIndex + objectName.length,
        });
        continue;
      }

      const field = objects[objectKey].find(f => 
        (f.propertyName && f.propertyName.toLowerCase() === propertyName.toLowerCase()) ||
        (f.columnName && f.columnName.toLowerCase() === propertyName.toLowerCase())
      );
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

      // Case-insensitive object name lookup
      const objectKey = Object.keys(objects).find(key => key.toLowerCase() === objectName.toLowerCase());
      if (!objectKey) continue;

      const field = objects[objectKey].find(f => 
        (f.propertyName && f.propertyName.toLowerCase() === propertyName.toLowerCase()) ||
        (f.columnName && f.columnName.toLowerCase() === propertyName.toLowerCase())
      );
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

  
const handleEditorDidMount = (editor, monaco) => {
  editorRef.current = editor;
  const model = editor.getModel();

  monaco.languages.registerCompletionItemProvider("plaintext", {
    triggerCharacters: ["."],

    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const objects = objectsRef.current || {};
      let suggestions: any[] = [];

      /* =====================================
         1️⃣ object.property suggestions
         ===================================== */
      const objectPropertyMatch = textUntilPosition.match(
        /([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/
      );

      if (objectPropertyMatch) {
        const typedObject = objectPropertyMatch[1];
        const typedField = objectPropertyMatch[2] || "";

        // Case-insensitive object lookup
        const objectKey = Object.keys(objects).find(
          key => key.toLowerCase() === typedObject.toLowerCase()
        );

        if (objectKey && Array.isArray(objects[objectKey])) {
          const fields = objects[objectKey]
            .filter(field =>
              (field.propertyName || "")
                .toLowerCase()
                .startsWith(typedField.toLowerCase())
            )
            .map(field => ({
              label: field.propertyName,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: field.propertyName,
              detail: field.dataType ? `Type: ${field.dataType}` : undefined,
              documentation: field.description,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - typedField.length,
                endColumn: position.column,
              },
            }));

          return { suggestions: fields };
        }

        return { suggestions: [] };
      }

      /* =====================================
         2️⃣ top-level object suggestions
         ===================================== */
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      suggestions = Object.keys(objects).map(objectKey => ({
        label: objectKey,
        kind: monaco.languages.CompletionItemKind.Module,
        insertText: objectKey,
        range,
      }));
      console.log("suggestions", suggestions);

      return { suggestions };
    },
  });
  // Validation setup
  const runValidation = () => {
    const value = model.getValue();
    const errors = validateFormulaIdentifiers(value, objectsRef.current);

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

      <main className="flex-1 flex flex-col p-5 overflow-hidden">
      <section className="w-full bg-white rounded-xl shadow border p-4 mb-4 flex-shrink-0">
  <div className="flex items-center justify-between mb-2">
    <div>
      <h1 className="text-xl font-semibold text-gray-900">
        Commission Formula Editor
      </h1>
      <p className="text-sm text-gray-500">
        Define conditions to evaluate commission rules
      </p>
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowLeftParsed(!showLeftParsed)}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
      >
        <IoIosSettings size={20}/>

      </button>

      <button
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
      >
        <IoIosHelpCircleOutline size={20}/>

        Help
      </button>
    </div>
  </div>


        {/* Error Display */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formula Editor */}
        
          <MonacoEditor
            height="80px"
            className="mt-5"
            defaultLanguage="plaintext"
            value={formula}
            onChange={(value) => {
              const newFormula = value || '';
              setFormula(newFormula);
              formulaRef.current = newFormula; // Keep ref in sync
              onFormulaChange?.(newFormula);
            }}
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
        {/* <div className="flex justify-end mb-4 flex-shrink-0">
          <Button 
            onClick={handleSave}
            disabled={saving}
            variant="orange"
            size="lg"
          >
            {saving ? 'Saving...' : 'Save Formula & Continue'}
          </Button>
        </div> */}

        <div className={`flex-1 ${showLeftParsed ? "flex gap-4" : ""} overflow-hidden`}>
          {showLeftParsed && (
            <section className="w-1/2 bg-white rounded-xl shadow border p-4 overflow-hidden flex flex-col">
              <input
                type="text"
                placeholder="Search fields (e.g., policy, customer, premium)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded text-sm text-gray-700 flex-shrink-0"
              />

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredFields.length > 0 ? (
                  filteredFields.map((f, index) => (
                    <div
                      key={`${f.objectKey}-${f.propertyName}-${index}`}
                      onClick={() => insertAtCursor(f.fullPath)}
                      className="cursor-pointer px-3 py-2 rounded bg-gray-100 hover:bg-indigo-100 text-sm"
                    >
                      <div className="font-mono text-indigo-700">
                        {f.fullPath}
                      </div>
                      <div className="text-xs text-gray-500">
                        {f.description}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">
                    {search.trim() !== "" ? "No matching fields" : "No fields available"}
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