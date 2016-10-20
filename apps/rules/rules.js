var stringUtils = new za.co.offcentreit.StringUtils();
var entityName = "";
var filePrefix = "entity:";
var entityFilter = "Person";
var currentRow;

var operatorLookupTable = [{
		key : "equals",
		value : "="
	}, {
		key : "not equal",
		value : "<>"
	}, {
		key : "greater than",
		value : ">"
	}, {
		key : "greater than or equal",
		value : ">="
	}, {
		key : "less than",
		value : "<"
	}, {
		key : "less than or equal",
		value : "<="
	},
];
var actionLookupTable = [{
		key : "hold",
		value : "hold"
	}, {
		key : "calculate fee",
		value : "calculateFee"
	}, {
		key : "flag AML",
		value : "flagAML"
	},
];
var propertyTypeLookupTable = [{
		key : "CHARACTER",
		value : "CHARACTER"
	}, {
		key : "VARCHAR",
		value : "VARCHAR"
	}, {
		key : "TEXT",
		value : "TEXT"
	}, {
		key : "LONGVARCHAR",
		value : "LONGVARCHAR"
	}, {
		key : "NUMERIC",
		value : "NUMERIC"
	}, {
		key : "DECIMAL",
		value : "DECIMAL"
	}, {
		key : "BIGINT",
		value : "BIGINT"
	}, {
		key : "BIT",
		value : "BIT"
	}, {
		key : "TINYINT",
		value : "TINYINT"
	}, {
		key : "SMALLINT",
		value : "SMALLINT"
	}, {
		key : "INTEGER",
		value : "INTEGER"
	}, {
		key : "BIGINT",
		value : "BIGINT"
	}, {
		key : "REAL",
		value : "REAL"
	}, {
		key : "FLOAT",
		value : "FLOAT"
	}, {
		key : "DOUBLEPRECISION",
		value : "DOUBLEPRECISION"
	}, {
		key : "BINARY",
		value : "BINARY"
	}, {
		key : "VARBINARY",
		value : "VARBINARY"
	}, {
		key : "LONGVARBINARY",
		value : "LONGVARBINARY"
	}, {
		key : "DATETIME",
		value : "DATETIME"
	}, {
		key : "DATE",
		value : "DATE"
	}, {
		key : "TIME",
		value : "TIME"
	}, {
		key : "TIMESTAMP",
		value : "TIMESTAMP"
	}, {
		key : "UNIQUEIDENTIFIER",
		value : "UNIQUEIDENTIFIER"
	}, {
		key : "IMAGE",
		value : "IMAGE"
	}
];

function showDropdown(element) {
	var event = new MouseEvent("mousedown");
	element.dispatchEvent(event);
}

function loadListFromStorage(listName, filter, replace, exclude) {
	var storage = getStorage();
	if (storage) {
		var messageDefinitionList = document.getElementById(listName);
		for (var i = messageDefinitionList.options.length - 1; i >= 0; i--) {
			messageDefinitionList.remove(i);
		}
		var firstOne = 0;
		for (var key in storage) {
			var option = document.createElement("option");
			var keyArray = key.split(":");
			option.text = keyArray[keyArray.length - 1];
			option.value = key;
			if (filter && filter.length > 0) {
				if (key.indexOf(filter) == 0) {
					if (replace && replace.toUpperCase() == "TRUE") {
						option.text = option.text.replace(filePrefix + filter, "");
					}
					if (exclude && key.indexOf(exclude) < 0) {
						if (firstOne == 0) {
							var emptyOption = document.createElement("option");
							emptyOption.text = "";
							emptyOption.value = "";
							messageDefinitionList.add(emptyOption);
						}
						firstOne++;
						messageDefinitionList.add(option);
					}
				}
			} else {
				if (exclude && key.indexOf(exclude) < 0) {
					if (firstOne == 0) {
						var emptyOption = document.createElement("option");
						emptyOption.text = "";
						emptyOption.value = "";
						messageDefinitionList.add(emptyOption);
					}
					firstOne++;
					messageDefinitionList.add(option);
				}
			}
		}
	}
}

function clearRuleUI(){
	clearTable("conditionsTable");
	clearTable("actionsTable");
  document.getElementById("titleRuleName").innerHTML = "";
  document.getElementById("entityRuleName").value = "";

  
}
function clearAllListsAndTables() {
	clearSelectList("entityPropertyList");
	clearSelectList("entityRulesList");
  clearRuleUI();
}

function loadListFromLookupTable(listId, lookupTable) {
	if (listId && lookupTable) {
		clearSelectList(listId);
		list = document.getElementById(listId);
		for (var i = 0; i < lookupTable.length; i++) {
			var option = document.createElement("option");
			option.text = lookupTable[i].key;
			option.value = lookupTable[i].value;
			list.add(option);
		}
	}
}

function initialise() {
	clearAllListsAndTables();
	clearSelectList("entityList");
	loadListFromStorage("entityList", filePrefix + entityFilter, "FALSE", ":");
	loadListFromLookupTable("operatorList", operatorLookupTable);
	loadListFromLookupTable("actionList", actionLookupTable);
	loadListFromLookupTable("editor_operator", operatorLookupTable);
}

function isEmpty(elementId) {
	var element = document.getElementById(elementId);
	return false;
}

function reloadEntityList() {
	clearSelectList("entityList");
	entityFilter = document.getElementById("entityFilterText").value;
	loadListFromStorage("entityList", filePrefix + entityFilter, "FALSE", ":rule:");
}

function clearTable(tableId) {
	document.getElementById(tableId).innerHTML = "";
}

function clearSelectList(selectId) {
	var select = document.getElementById(selectId);
	while (select.firstChild) {
		select.removeChild(select.firstChild);
	}
}

function getCurrentOption(listId) {
	var option = document.getElementById(listId).options[document.getElementById(listId).selectedIndex];
	return option;
}

function retrieveEntity() {
	var storage = getStorage();
	clearAllListsAndTables();
	if (storage) {
		var entityList = document.getElementById("entityList");
		var selectedItem = entityList.options[entityList.selectedIndex].value;
		entityName = selectedItem;
		var output = storage.getItem(entityName);

		var key = entityName + ":";
		loadListFromStorage("entityRulesList", key, "TRUE", " ");
		var entityNameArray = selectedItem.split(":");
		if (entityNameArray.length > 0) {
			entityName = entityNameArray[1];
		}

    document.getElementById("titleEntityName").innerHTML = entityName;

		var entityPropertyList = document.getElementById("entityPropertyList");

		try {
			var jsonVar = JSON.parse(output);
			if (jsonVar) {
				var rowCount = jsonVar.length;
				for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
					addEntityPropertyToList(jsonVar[rowIndex].name + ":" + jsonVar[rowIndex].type + ":" + jsonVar[rowIndex].size, entityPropertyList);
				}
				multipleColumnSelect("entityPropertyList");
			}
			document.getElementById("conditionEntityName").innerHTML = entityName;
		} catch (exception) {
			Dialog.showMessageDialog("errorDialog", "Failed to retrieve entity (" + exception + ")");
		}

	}
}

function addEntityPropertyToList(fieldName, propertyList) {
	var opt = document.createElement("option");
	opt.value = fieldName;
	opt.innerHTML = fieldName;
	propertyList.appendChild(opt);
}

function addConditionRow(property, operator, propertyValue) {
	var conditionsTable = document.getElementById("conditionsTable").getElementsByTagName("tbody")[0];
	if (!conditionsTable) {
		document.getElementById("conditionsTable").appendChild(document.createElement("tbody"))
		conditionsTable = document.getElementById("conditionsTable").getElementsByTagName("tbody")[0];
	}
	if (conditionsTable) {
		var row = conditionsTable.insertRow(-1);
		row.insertCell(0).innerHTML = property;
		row.insertCell(1).innerHTML = operator;
		row.insertCell(2).innerHTML = propertyValue;
		var output = "&nbsp;&nbsp;<input type=\"button\" class=\"glass btn green\" value=\"edit\" onclick=\"editCondition(this)\" title=\"edit\"/>";
		output += "&nbsp;&nbsp;<input type=\"button\" class=\"glass btn red\"   value=\"del\"  onclick=\"deleteRow(this)\" title=\"delete\"/>";
		row.insertCell(3).innerHTML = output;
	}
}

function addCondition() {
	try {
		var property = document.getElementById("entityPropertyList").options[document.getElementById("entityPropertyList").selectedIndex].value;
		var operator = document.getElementById("operatorList").options[document.getElementById("operatorList").selectedIndex].value;
		var propertyValue = document.getElementById("propertyValue").value;
		if (propertyValue && propertyValue.length > 0) {
			addConditionRow(property, operator, propertyValue);
		} else {
			focusOn("propertyValue");
			Dialog.showMessageDialog("errorDialog", "Please supply the property value.");
		}
	} catch (exception) {
		focusOn("entityList");
		Dialog.showMessageDialog("errorDialog", "Please select entity.");
	}
}

function addActionRow(actionValue) {
	var actionsTable = document.getElementById("actionsTable");
	var row = actionsTable.insertRow(-1);
	row.insertCell(0).innerHTML = actionValue;
	var output = "&nbsp;&nbsp;<input type=\"button\" class=\"glass btn red\" value=\"del\" onclick=\"deleteRow(this)\" title=\"delete\"/>";
	row.insertCell(1).innerHTML = output;
}

function addAction() {
	if (entityName && entityName.length > 0) {
		var actionValue = document.getElementById("actionList").options[document.getElementById("actionList").selectedIndex].value;
		addActionRow(actionValue);
	} else {
		focusOn("entityList");
		Dialog.showMessageDialog("errorDialog", "Please select entity.");
	}
}

function deleteRow(thisRow) {
	var responseButton = document.getElementById("IamSureButton");
	var areYouSureMessage = document.getElementById("areYouSureMessage");
	responseFunction = function () {
		deleteRowFromTable(thisRow);
		Dialog.closeDialog("areYouSureDialog");
	};
	if (responseButton.removeEventListener) {
		responseButton.removeEventListener("click", responseFunction);
	}
	areYouSureMessage.innerHTML = "Do you want to delete the field <b>" + thisRow.parentNode.parentNode.cells[0].innerHTML + "</b>?";
	responseButton.addEventListener("click", responseFunction);
	Dialog.showDialog("areYouSureDialog");
}

function deleteRowFromTable(thisRow) {
	if (thisRow) {
		var p = thisRow.parentNode.parentNode;
		p.parentNode.removeChild(p);
	}
}

function getJsonRuleObject(ruleJsonText) {
	return JSON.parse(ruleJsonText);
}

function populateRuleUI(ruleJsonText, ruleNameText) {
	if (ruleJsonText && ruleJsonText.length > 0) {
		document.getElementById("entityRuleName").value = getCurrentOption("entityRulesList").text;
		var ruleJsonObject = getJsonRuleObject(ruleJsonText);
		if (ruleJsonObject) {
			var conditions = ruleJsonObject.conditions;
			if (conditions && conditions.length > 0) {
				for (var i = 0; i < conditions.length; i++) {
					addConditionRow(conditions[i].property, conditions[i].operator, conditions[i].propertyValue);
				}
			}
			var actions = ruleJsonObject.actions;
			if (actions && actions.length > 0) {
				for (var i = 0; i < actions.length; i++) {
					addActionRow(actions[i].action);
				}
			}
      document.getElementById("titleRuleName").innerHTML = ruleNameText;
      document.getElementById("entityRuleName").value = ruleNameText;
		}
  }
}

function retrieveRule() {
	clearTable("conditionsTable");
	clearTable("actionsTable");
	clearRuleUI();
  var ruleName = getCurrentOption("entityRulesList");
	var storage = getStorage();
	if (storage && ruleName && ruleName.value && ruleName.value.length > 0) {
		var output = storage.getItem(ruleName.value);
		populateRuleUI(output, ruleName.text);
	}
}

function getEntityRuleConditions() {
	var output = "";
	var conditionsTable = document.getElementById("conditionsTable");

	var rows = conditionsTable.rows;
	if (rows && rows.length > 0) {
		output += "\"conditions\":[";
		for (var i = 0; i < rows.length; i++) {
			if (i > 0) {
				output += ",";
			}
			var cells = rows[i].cells;
			output += "{\"property\":\"" + cells[0].innerHTML + "\",";
			output += "\"operator\":\"" + cells[1].innerHTML + "\",";
			output += "\"propertyValue\":\"" + cells[2].innerHTML + "\"}";
		}
		output += "]";
	} else {
		output += "\"conditions\":[]";
	}
	return output;
}

function getEntityRuleActions() {
	var output = "";
	var actionsTable = document.getElementById("actionsTable");
	var rows = actionsTable.rows;
	if (rows && rows.length > 0) {
		output += "\"actions\":[";
		for (var i = 0; i < rows.length; i++) {
			if (i > 0) {
				output += ",";
			}
			var cells = rows[i].cells;
			output += "{\"action\":\"" + cells[0].innerHTML + "\"}";
		}
		output += "]";
	} else {
		output += "\"actions\":[]";
	}
	return output;
}

function getRuleJsonText() {
	var ruleName = document.getElementById("entityRuleName").value;
	var entityRuleConditions = getEntityRuleConditions();
	var entityRuleActions = getEntityRuleActions();
	var output = "{";
	output += "\"entity\":\"" + entityName + "\",";
	output += "\"rule\":\"" + ruleName + "\",";
	output += entityRuleConditions + "," + entityRuleActions;
	output += ",\"status\":\"1\"";
	output += "}";
	return output
}

function saveEntityRule(entityRuleNameId) {
	var entityRuleName = document.getElementById(entityRuleNameId).value;
	var output = "";
	if (entityName.length > 0) {
		if (entityRuleName && entityRuleName.length > 0) {
			var ruleJsonText = getRuleJsonText();
			var savedRule = filePrefix + entityName + ":rule:" + entityRuleName;
			var storage = getStorage();
			if (storage) {
				storage.setItem(savedRule, ruleJsonText);
				document.getElementById(entityRuleNameId).value = "";
				clearSelectList("entityRulesList");
				var key = entityName + ":rule:";
				loadListFromStorage("entityRulesList", filePrefix + key, "TRUE", " ");
				output = "rule " + entityRuleName + " saved successfully for entity " + entityName + ".";
				Dialog.showMessageDialog("infoDialog", output);
			} else {
				output = "I cannot store anything on your system.";
				Dialog.showMessageDialog("errorDialog", output);
			}
		} else {
			focusOn(entityRuleNameId)
			output = "Please supply rule name.";
			Dialog.showMessageDialog("errorDialog", output);
		}
	} else {
		focusOn("entityList");
		output = "Please select entity.";
		Dialog.showMessageDialog("errorDialog", output);
	}
}

function showRuleJson() {
	document.getElementById("jsonTextArea").value = getRuleJsonText();
	formatJSON("jsonTextArea");
	document.getElementById("jsonDialogTitle").innerHTML = "Rule : " + document.getElementById("entityRuleName").value;
	Dialog.showDialog("jsonDialog");
}

function minifyJSON(jsonTextAreaId) {
	var output = document.getElementById(jsonTextAreaId).value;
	document.getElementById(jsonTextAreaId).value = vkbeautify.jsonmin(output);
}

function formatJSON(jsonTextAreaId) {
	var output = document.getElementById(jsonTextAreaId).value;
	document.getElementById(jsonTextAreaId).value = vkbeautify.json(output);
}

function getEnglishText() {
	var output = "";
	var ruleJsonText = getRuleJsonText();
	var ruleJsonObject = getJsonRuleObject(ruleJsonText);
	if (ruleJsonObject) {
		var conditions = ruleJsonObject.conditions;
		output += "If you see ";
		if (entityName.length > 0) {
			output += entityName;
		} else {
			output += "nothing"
		}
		if (conditions && conditions.length > 0) {
			output += " whose \n";
			for (var i = 0; i < conditions.length; i++) {
				if (i > 0) {
					output += " and \n"
				}
				output += stringUtils.indent(2) + conditions[i].property.split(":")[0] + " " + stringUtils.htmlDecode(conditions[i].operator) + " " + conditions[i].propertyValue;
			}
		}
		var actions = ruleJsonObject.actions;
		output += "\nthen ";
		if (actions && actions.length > 0) {
			output += "do the following actions: \n";
			for (var i = 0; i < actions.length; i++) {
				if (i > 0) {
					output += " and \n"
				}
				output += stringUtils.indent(2) + actions[i].action;
			}
		} else {
			output += "do nothing.";
		}
	}
	return output;
}

function showEnglishText() {
	document.getElementById("englishDialogTitle").innerHTML = "The rule, " + document.getElementById("entityRuleName").value + ", states:";
	document.getElementById("englishTextArea").value = getEnglishText();
	Dialog.showDialog("englishDialog");
}

function showConditionEditor(thisRow) {
	currentRow = thisRow.parentNode.parentNode;
	if (currentRow) {
		document.getElementById("editor_property").value = currentRow.cells[0].innerHTML.split(":")[0];
		document.getElementById("editor_propertyType").value = currentRow.cells[0].innerHTML.split(":")[1];
		if (currentRow.cells[0].innerHTML.split(":")[2]) {
			document.getElementById("editor_propertySize").value = currentRow.cells[0].innerHTML.split(":")[2];
		} else {
			document.getElementById("editor_propertySize").value = "null";
		}
		document.getElementById("editor_operator").value = stringUtils.htmlDecode(currentRow.cells[1].innerHTML);
		document.getElementById("editor_propertyValue").value = currentRow.cells[2].innerHTML;
	}
	Dialog.showDialog("conditionEditorDialog");
}

function saveCondition() {
	if (currentRow) {
		var propertyCol = document.getElementById("editor_property").value;
		propertyCol += ":" + document.getElementById("editor_propertyType").value;
		if (document.getElementById("editor_propertySize") && document.getElementById("editor_propertySize").value != "null") {
			propertyCol += ":" + document.getElementById("editor_propertySize").value;
		}
		currentRow.cells[0].innerHTML = propertyCol;
		currentRow.cells[1].innerHTML = document.getElementById("editor_operator").options[document.getElementById("editor_operator").selectedIndex].value;
		currentRow.cells[2].innerHTML = document.getElementById("editor_propertyValue").value;
	}
	Dialog.closeDialog("conditionEditorDialog");
}

function editCondition(thisRow) {
	if (thisRow) {
		currentRow = thisRow;
		showConditionEditor(thisRow)
	}
}

function getSqlText() {
	var output = "";
	var entityName = getCurrentOption("entityList").text;
	var ruleName = document.getElementById("entityRuleName").value;
	var ruleJsonText = getRuleJsonText();
	var ruleJsonObject = getJsonRuleObject(ruleJsonText);
	if (ruleJsonObject) {
		output += "BEGIN\n";
		output += stringUtils.indent(2) + "DECLARE @rulesProfileId NUMERIC(20,0)\n";
		output += stringUtils.indent(2) + "DECLARE @entityRulesId NUMERIC(20,0)\n";
		output += stringUtils.indent(2) + "INSERT INTO RulesProfile(rulesProfileCode, statusCode ) VALUES (";
		output += "'Rules Profile 001','00')\n";
		output += stringUtils.indent(2) + "SELECT @rulesProfileId = @@IDENTITY\n";
		output += stringUtils.indent(2) + "INSERT INTO EntityRules (rulesProfileId, entityName,ruleName,statusCode) VALUES (";
		output += "@rulesProfileId,'" + entityName + "','" + ruleName + "','00')\n";
		output += stringUtils.indent(2) + "SELECT @entityRulesId = @@IDENTITY\n";
		var actions = ruleJsonObject.actions;
		if (actions && actions.length > 0) {
			for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
				output += stringUtils.indent(2) + "INSERT INTO RuleActions (entityRulesId,action) VALUES (";
				output += "@entityRulesId,";
				output += "'" + actions[actionIndex].action + "')\n";
			}
			var conditions = ruleJsonObject.conditions;
			if (conditions && conditions.length > 0) {
				for (var i = 0; i < conditions.length; i++) {
					output += stringUtils.indent(2) + "INSERT INTO RuleConditions (entityRulesId,property,propertyType,operator,propertyValue)";
					output += " VALUES (";
					output += "@entityRulesId,"
					output += "'" + conditions[i].property.split(":")[0] + "',";
					output += "'" + conditions[i].property.split(":")[1] + "',";
					output += "'" + stringUtils.htmlDecode(conditions[i].operator) + "',";
					output += "'" + conditions[i].propertyValue + "'";
					output += ")\n";
				}
			}
		}
		output += "END\nGO\n";
	}
	return output;
}

function showRuleSQL() {
	document.getElementById("sqlDialogTitle").innerHTML = document.getElementById("entityRuleName").value;
	var sqlText = getSqlText();
	if (sqlText && sqlText.length > 0) {
		document.getElementById("sqlTextArea").value = getSqlText();
		var ruleName = document.getElementById("entityRuleName").value;
		if (ruleName.length > 0) {
			Dialog.showDialog("sqlDialog");
		} else {
			Dialog.showMessageDialog("errorDialog", "Please supply rule name.");
		}
	} else {
		Dialog.showMessageDialog("errorDialog", "Sorry, there is not enough data to generate SQL.");
	}
}

function showFieldListItems(field, listId) {
	field.style.display = "none";
	document.getElementById(listId).style.display = "block";
	showDropdown(document.getElementById(listId));
}

function updateFieldWithSelectedItem(list, fieldId) {
	document.getElementById(fieldId).value += list.options[list.selectedIndex].value.split(":")[0];
	document.getElementById(fieldId).style.display = "block";
	list.style.display = "none";
}

function getStorage() {
	var storage = window.localStorage;
	if (!storage) {
		storage = localStorage;
	}
	return storage;
}

function focusOn(elementId) {
	document.getElementById(elementId).focus();
}

function multipleColumnSelect(selectId) {
	var s = document.getElementById(selectId).options,
	l = [],
	d = "";

	for (i = 0; i < s.length; i++) {
		column = s[i].text.split(':');
		for (j = 0; j < column.length; j++) {
			if (!l[j])
				l[j] = 0;
			if (column[j].length > l[j]) {
				l[j] = column[j].length;
			}
		}
	}

	for (i = 0; i < s.length; i++) {
		column = s[i].text.split(":");
		temp_line = "";
		for (j = 0; j < column.length; j++) {
			t = (l[j] - column[j].length);
			d = "\u00a0";
			for (k = 0; k < t; k++) {
				d += "\u00a0";
			}
			temp_line += column[j] + d;
		}
		s[i].text = temp_line;
	}
}
