"use strict";
exports.__esModule = true;
var EditSwitch = function (_a) {
    var isEdit = _a.isEdit, setIsEdit = _a.setIsEdit;
    return (React.createElement("div", { className: "flex items-center gap-3" },
        React.createElement("span", { className: "font-medium text-gray-700" }, "Edit"),
        React.createElement("label", { className: "relative inline-flex items-center cursor-pointer" },
            React.createElement("input", { type: "checkbox", className: "sr-only peer", checked: isEdit, onChange: function () { return setIsEdit(!isEdit); } }),
            React.createElement("div", { className: "w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300" }),
            React.createElement("div", { className: "absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 " + (isEdit ? 'translate-x-6' : '') })),
        React.createElement("span", { className: "font-medium text-gray-700" }, isEdit ? 'On' : 'Off')));
};
exports["default"] = EditSwitch;
