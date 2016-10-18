var currentRow;
var responseFunction;

var queryString = function () {
	// This function is anonymous, is executed immediately and
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}
();

xPos = 0, yPos = 0,
xElem = 0, yElem = 0;



function logQueryString() {
	if (queryString) {
		log("query string : " + JSON.stringify(queryString));
	}
}

function indent(indentCount) {
	var indentString = "";
	for (var i = 0; i < indentCount; i++) {
		indentString += "\u00a0";
	}
	return indentString;
}

function getXsdBaseType(type) {
	if (type) {
		if (type == "CHAR" || type == "CHARACTER" || type == "VARCHAR" || type == "LONGVARCHAR" || type == "TEXT") {
			return "string";
		} else if (type == "NUMERIC" || type == "DECIMAL" || type == "BIGINT") {
			return "decimal";
		} else if (type == "BIT" || type == "TINYINT" || type == "SMALLINT" || type == "INTEGER" || type == "INT") {
			return "integer";
		} else if (type == "BIGINT") {
			return "Long";
		} else if (type == "REAL") {
			return "Float";
		} else if (type == "FLOAT" || type == "DOUBLEPRECISION") {
			return "Double";
		} else if (type == "BINARY" || type == "VARBINARY" || type == "LONGVARBINARY" || type == "IMAGE") {
			return "byte[]";
		} else if (type == "DATETIME") {
			return "dateTime";
		} else if (type == "DATE") {
			return "date";
		} else if (type == "TIME") {
			return "java.sql.Time";
		} else if (type == "TIMESTAMP") {
			return "java.sql.Timestamp";
		}
		return type;
	}
}

function getJavaType(type) {
	if (type) {
		if (type == "CHAR" || type == "CHARACTER" || type == "VARCHAR" || type == "LONGVARCHAR" || type == "TEXT") {
			return "String";
		} else if (type == "NUMERIC" || type == "DECIMAL" || type == "BIGINT") {
			return "BigDecimal";
		} else if (type == "BIT" || type == "TINYINT" || type == "SMALLINT" || type == "INTEGER" || type == "INT") {
			return "Integer";
		} else if (type == "BIGINT") {
			return "Long";
		} else if (type == "REAL") {
			return "Float";
		} else if (type == "FLOAT" || type == "DOUBLEPRECISION") {
			return "Double";
		} else if (type == "BINARY" || type == "VARBINARY" || type == "LONGVARBINARY" || type == "IMAGE") {
			return "byte[]";
		} else if (type == "DATETIME" || type == "DATE") {
			return "java.util.Calendar";
		} else if (type == "TIME") {
			return "java.sql.Time";
		} else if (type == "TIMESTAMP") {
			return "java.sql.Timestamp";
		}
		return type;
	}
}

function addRow() {
	var fieldName = document.getElementById("fieldName").value;
	var fieldType = document.getElementById("fieldType").options[document.getElementById("fieldType").selectedIndex].text;
	var javaType = getJavaType(fieldType);
	var fieldSize = document.getElementById("fieldSize").value;
	var nullable = document.getElementById("nullableList").options[document.getElementById("nullableList").selectedIndex].value;
	addRowFields(fieldName, fieldType, javaType, fieldSize, nullable);
}

function addRowFields(fieldName, fieldType, javaType, fieldSize, nullable) {
	var table = document.getElementById("messageDefinitionTable").getElementsByTagName("tbody")[0];
	if (fieldName.length > 0 && fieldSize.length > 0) {
		var row = table.insertRow(-1);
		row.insertCell(0).innerHTML = fieldName;
		row.insertCell(1).innerHTML = fieldType;
		row.insertCell(2).innerHTML = javaType;
		row.insertCell(3).innerHTML = fieldSize;
		row.insertCell(4).innerHTML = nullable;
		row.insertCell(5).innerHTML = addRowActions(); //+ addSortActions()
	}
}

function addSortActions() {
	var output = "";
	output += "&nbsp;&nbsp;<input type=\"button\" class=\"glass btn blue\" value=\"&#8593;\" onclick=\"moveRowUp(this)\" title=\"move up\"/>"; //up arrow
	output += "&nbsp;&nbsp;<input type=\"button\" class=\"glass btn blue\" value=\"&#8595;\" onclick=\"moveRowDown(this)\" title=\"move down\"/>"; //down arrow
	return output;
}

function addRowActions() {
	var output = "";
	output += "&nbsp;&nbsp;<input type=\"button\" class=\"editBtn btn\" onclick=\"editField(this)\" title=\"edit\"/>"; //x
	output += "&nbsp;&nbsp;<input type=\"button\" class=\"deleteBtn btn\" onclick=\"deleteRow(this)\" title=\"delete\"/>"; //x
	return output;
}

function deleteRow(thisRow) {
	var responseButton = document.getElementById("IamSureButton");
	var areYouSureMessage = document.getElementById("areYouSureMessage");
	if (responseButton.removeEventListener) {
		responseButton.removeEventListener("click", responseFunction);
	}
	areYouSureMessage.innerHTML = "Do you want to delete the field <b>" + thisRow.parentNode.parentNode.cells[0].innerHTML + "</b>?";
	responseFunction = function () {
		deleteRowFromTable(thisRow);
		closeDialog("areYouSureDialog");
	};
	responseButton.addEventListener("click", responseFunction);
	showDialog("areYouSureDialog");
}

function deleteRowFromTable(thisRow) {
	if (thisRow) {
		var p = thisRow.parentNode.parentNode;
		p.parentNode.removeChild(p);
	}
}

function moveRowUp(thisRow) {
	if (thisRow) {
		var currentRow = thisRow.parentNode.parentNode;
		var previousRow = currentRow.previousSibling;
		var table = currentRow.parentNode;
		if (previousRow && previousRow != "null" && previousRow.rowIndex > 0) {
			swapChildren(table, currentRow, previousRow);
		}
	}
}

function moveRowDown(thisRow) {
	if (thisRow) {
		var currentRow = thisRow.parentNode.parentNode;
		var nextRow = currentRow.nextSibling;
		var table = currentRow.parentNode;
		if (nextRow && nextRow != "null" && nextRow.rowIndex <= table.rows.length) {
			swapChildren(table, currentRow, nextRow);
		}
	}
}

function swapChildren(table, child1, child2) {
	if (table && child1 && child2) {
		var tempChild = child1.innerHTML;
		table.rows[child1.rowIndex].innerHTML = child2.innerHTML;
		table.rows[child2.rowIndex].innerHTML = tempChild;
	}
}

function createCommonVariables() {
	var output = "";
	output += indent(2) + "private static final long serialVersionUID = 1L;<br/>";
	return output;
}

function createVariables() {
	var table = document.getElementById("messageDefinitionTable");
	var recordName = getTableName();
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += indent(2) + "protected BigDecimal " + lowerCaseFirstLetter(recordName) + "Id;<br/>";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(2) + "protected " + row.cells[2].innerHTML + " " + row.cells[0].innerHTML + ";<br/>";
	}
	output += "<br/>";
	return output;
}

function createConstructors() {
	var recordName = getTableName();
	var output = indent(2) + "public " + recordName + "Adaptor() {<br/>";
	output += indent(2) + "}<br/><br/>";
	return output;
}

function createVariableAccessors() {
	var table = document.getElementById("messageDefinitionTable");
	var recordName = getTableName();
	var rowCount = table.rows.length;
	var output = "";

	output += indent(2) + "public void set" + capitalizeFirstLetter(recordName) + "Id(BigDecimal " + lowerCaseFirstLetter(recordName) + "Id) {<br/>";
	output += indent(4) + "this." + lowerCaseFirstLetter(recordName) + "Id = " + lowerCaseFirstLetter(recordName) + "Id;<br/>";
	output += indent(2) + "}<br/><br/>";
	output += indent(2) + "public BigDecimal get" + capitalizeFirstLetter(recordName) + "Id(){<br/>";
	output += indent(4) + "return " + lowerCaseFirstLetter(recordName) + "Id;<br/>";
	output += indent(2) + "}<br/><br/>";

	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(2) + "public " + row.cells[2].innerHTML + " get" + capitalizeFirstLetter(row.cells[0].innerHTML) + "(){<br/>";
		output += indent(4) + "return " + row.cells[0].innerHTML + ";<br/>";
		output += indent(2) + "}<br/><br/>";
		output += indent(2) + "public void set" + capitalizeFirstLetter(row.cells[0].innerHTML) + "(" + row.cells[2].innerHTML + " " + row.cells[0].innerHTML + ") {<br/>";
		output += indent(4) + "this." + row.cells[0].innerHTML + " = " + row.cells[0].innerHTML + ";<br/>";
		output += indent(2) + "}<br/><br/>";
	}
	output += "<br/>";
	return output;
}

function getTableName() {
	var tableName = capitalizeFirstLetter(document.getElementById("recordName").value);
	if (tableName && tableName.length > 0) {
		return tableName;
	}
	return "Example";
}

function capitalizeFirstLetter(string) {
	if (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	return string;
}

function lowerCaseFirstLetter(string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
}

function generateXsdTypes(minify) {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var generatedCode = document.getElementById("xsdTypes");
	var output = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>";
	output += "<xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" elementFormDefault=\"qualified\" attributeFormDefault=\"unqualified\">";
  
  output += "<xs:element name=\""+ lowerCaseFirstLetter(recordName) +"\" type=\""+recordName + "Type\"/>";
  
	output += "<xs:complexType name=\"" + recordName + "Type\">";
	output += "<xs:sequence>";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
    var type = getXsdBaseType(row.cells[1].innerHTML);
		output += "<xs:element name=\"";
		output += lowerCaseFirstLetter(row.cells[0].innerHTML);
		output += "\" minOccurs=\"1\">";
    output += "<xs:simpleType>";
		output += "<xs:restriction base=\"xs:" + type + "\">";
    if ( type == "integer") {
      output += "<xs:totalDigits value=\"" + row.cells[3].innerHTML + "\"/>";
    } else if (type != "date"){
      output += "<xs:maxLength value=\"" + row.cells[3].innerHTML + "\"/>";
    }
		output += "</xs:restriction>";
		output += "</xs:simpleType>";
		output += "</xs:element>";

	}
	output += "</xs:sequence>";
	output += "</xs:complexType>";
	output += "</xs:schema>";
	var parser = new DOMParser();
	var doc = parser.parseFromString(output, "text/xml");
	var docString = vkbeautify.xml((new XMLSerializer()).serializeToString(doc), 2);
	log(docString);
	if (minify == true) {
		generatedCode.textContent = vkbeautify.xmlmin(docString);
	} else {
		generatedCode.textContent = docString;
	}
}

function minifyXsdTypes() {
	generateXsdTypes(true);
}

function generateJavaAdaptor() {
	var recordName = getTableName();
	var output = "public class " + recordName + "Adaptor extends DataRecord {<br/>";
	var generatedCode = document.getElementById("generatedCode");
	output += createCommonVariables();
	output += createVariables();
	output += createConstructors();
	output += createVariableAccessors();
	output += "}<br/><br/>";
	generatedCode.innerHTML = applyJavaColor(output);
}

function generateJavaXsdToAdaptor() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "";
	var generatedCode = document.getElementById("generatedCode");
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(2) + lowerCaseFirstLetter(recordName) + "Adaptor.set" + capitalizeFirstLetter(row.cells[0].innerHTML);
		output += "(" + lowerCaseFirstLetter(recordName) + ".get" + capitalizeFirstLetter(row.cells[0].innerHTML) + "());<br/>";
	}
	generatedCode.innerHTML = applyJavaColor(output);
}

function generateJavaAdaptorToXsd() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "";
	var generatedCode = document.getElementById("generatedCode");
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(2) + lowerCaseFirstLetter(recordName) + ".set" + capitalizeFirstLetter(row.cells[0].innerHTML);
		output += "(" + lowerCaseFirstLetter(recordName) + "Adaptor.get" + capitalizeFirstLetter(row.cells[0].innerHTML) + "());<br/>";
	}
	generatedCode.innerHTML = applyJavaColor(output);
}

function generateTCsql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "SET ANSI_PADDING ON<br/>";
	output += "GO<br/><br/>";
	output += "CREATE TABLE " + recordName + " (<br/>";
	output += indent(2) + lowerCaseFirstLetter(recordName) + "Id NUMERIC(20,0) IDENTITY(1,1) NOT NULL";

	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		if (rowIndex == 1) {
			output += ",<br/>";
		}
		output += indent(2) + lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " " + row.cells[4].innerHTML;
		if (rowIndex < rowCount - 1) {
			output += ",<br/>"
		}

	}
	output += "<br/>)<br/>";
	output += "<br/>GO"
	return output;
}

function generateSPCreateSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "CREATE PROCEDURE create" + recordName + "<br/>(<br/>";
	output += indent(2) + "@" + lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0) OUTPUT,";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		if (rowIndex == 1) {
			output += "<br/>"
		}
		var row = table.rows[rowIndex];
		output += indent(2) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " = NULL";
		if (rowIndex < rowCount - 1) {
			output += ",<br/>";
		}
		if (rowIndex == rowCount - 1) {
			output += ",";
		}
	}
	output += "<br/>";
	output += indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
	output += ") AS BEGIN<br/><br/>";
	output += indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
	if (rowCount > 1) {
		output += indent(2) + "SELECT<br/>";
		output += indent(4) + "@returnCode = COUNT(*)<br/>";
		output += indent(2) + "FROM<br/>";
		output += indent(4) + recordName + " <br/>";
		output += indent(2) + "WHERE <br/>"
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " ";
			if (rowIndex < rowCount - 1) {
				output += " AND <br/>";
			}
		}
	}
	output += "<br/><br/>";
	output += indent(2) + "IF (@returnCode > 0) BEGIN<br/>";
	output += indent(4) + "SET @returnMsg = 'Unable to create " + splitWord(recordName) + ", a " + splitWord(recordName) + " already EXISTS with the code supplied.'<br/>";
	output += indent(4) + "RETURN 1<br/>";
	output += indent(2) + "END<br/><br/>";
	if (rowCount > 1) {
		output += indent(2) + "INSERT INTO<br/>";
		output += indent(4) + recordName + "<br/>";
		output += indent(2) + "(<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += indent(2) + ") VALUES (<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += indent(2) + ")<br/><br/>";
	}
	output += indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";
	output += indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
	output += indent(4) + "SELECT @returnMsg = 'Failed to create/insert " + splitWord(recordName) + ".'<br/>";
	output += indent(4) + "RETURN 1<br/>";
	output += indent(2) + "END<br/><br/>";
	output += indent(2) + "SELECT @" + lowerCaseFirstLetter(recordName) + "Id = @@IDENTITY<br/>";
	output += indent(2) + "SELECT @returnMsg = 'Successfully created " + splitWord(recordName) + ".'<br/>";
	output += indent(2) + "RETURN 0<br/>"
	output += "END<br/>GO<br/>"
	return output;
}

function generateSPRetrieveSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "CREATE PROCEDURE retrieve" + recordName + "<br/>(<br/>";
	output += indent(2) + "@" + lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0) OUTPUT,<br/>";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(2) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " OUTPUT,<br/>";
	}
	output += indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
	output += ") AS BEGIN<br/><br/>";
	output += indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
	output += indent(2) + "SELECT<br/>";
	output += indent(4) + "@" + lowerCaseFirstLetter(recordName) + "Id = " + lowerCaseFirstLetter(recordName) + "Id";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		if (rowIndex == 1) {
			output += ",<br/>";
		}
		output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = " + lowerCaseFirstLetter(row.cells[0].innerHTML);
		if (rowIndex < rowCount - 1) {
			output += ",<br/>";
		}
	}
	output += "<br/>";
	output += indent(2) + "FROM<br/>";
	output += indent(4) + recordName + "<br/>";
	output += indent(2) + "WHERE<br/>";
	output += indent(4) + lowerCaseFirstLetter(recordName) + "Id = @" + lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
	output += indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";
	output += indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
	output += indent(4) + "SELECT @returnMsg = 'Failed to retrieve " + splitWord(recordName) + ".'<br/>";
	output += indent(4) + "RETURN 1<br/>";
	output += indent(2) + "END<br/><br/>";
	output += indent(2) + "SELECT @returnMsg = 'Successfully retrieved " + splitWord(recordName) + ".'<br/><br/>";
	output += indent(2) + "RETURN 0<br/>"
	output += "END<br/>GO<br/>"
	return output;
}

function generateSPSearchSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "CREATE PROCEDURE search" + recordName + "<br/>(<br/>";
	output += indent(2) + "@batchSize INTEGER";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		if (rowIndex == 1) {
			output += ",<br/>";
		}
		output += indent(2) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML);
		if (rowIndex < rowCount - 1) {
			output += ",<br/>";
		}
	}
	output += ",<br/>";
	output += indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
	output += ") AS BEGIN<br/><br/>";
	output += indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
	output += indent(2) + "IF (@batchSize = -1) BEGIN<br/>";
	output += indent(4) + "SET rowcount 0<br/>";
	output += indent(2) + "END ELSE BEGIN<br/>";
	output += indent(4) + "SET rowcount @batchSize<br/>";
	output += indent(2) + "END<br/><br/>";
	if (rowCount > 1) {
		output += indent(2) + "SELECT<br/>";
		output += indent(4) + lowerCaseFirstLetter(recordName) + "Id";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			if (rowIndex == 1) {
				output += ",<br/>";
			}
			output += indent(4) + lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += indent(2) + "FROM<br/>";
		output += indent(4) + recordName + "<br/>";
		output += indent(2) + "WHERE<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];

			var sqlType = row.cells[1].innerHTML;
			if (sqlType == "VARCHAR" || sqlType == "CHARACTER") {
				output += indent(4) + "(";
				output += "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " IS NULL OR ";
				output += lowerCaseFirstLetter(row.cells[0].innerHTML) + " LIKE '%' + @";
				output += lowerCaseFirstLetter(row.cells[0].innerHTML) + " + '%'";
				output += ")";
			} else {
				output += indent(4) + "(";
				output += "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " IS NULL OR ";
				output += lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @";
				output += lowerCaseFirstLetter(row.cells[0].innerHTML);
				output += ")";
			}
			output += " AND<br/>";
		}
		output += indent(4) + "(@batchSize <> 0)";
		output += "<br/><br/>";
	}
	output += indent(2) + "SELECT @returnMsg = 'Successfully searched " + splitWord(recordName) + "'<br/>";
	output += indent(2) + "RETURN 0<br/>"
	output += "END<br/>GO<br/>"
	return output;
}

function generateSPListSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "CREATE PROCEDURE list" + recordName + " <br/>";
	output += "AS BEGIN<br/><br/>";
	output += indent(2) + "SELECT<br/>";
	output += indent(4) + lowerCaseFirstLetter(recordName) + "Id";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		if (rowIndex == 1) {
			output += ",<br/>";
		}
		output += indent(4) + lowerCaseFirstLetter(row.cells[0].innerHTML);
		if (rowIndex < rowCount - 1) {
			output += ",<br/>";
		}
	}
	output += "<br/>";
	output += indent(2) + "FROM<br/>";
	output += indent(4) + recordName + "<br/><br/>";
	output += indent(2) + "RETURN 0<br/>"
	output += "END<br/>GO<br/>"
	return output;
}

function generateSPDeleteSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "CREATE PROCEDURE delete" + recordName + "<br/>(<br/>";
	output += indent(2) + "@" + lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0),<br/>";
	output += indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
	output += ") AS BEGIN<br/><br/>";
	output += indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
	if (rowCount > 1) {
		output += declareVariables();
		output += "<br/>";
	}

	if (rowCount > 1) {
		output += indent(2) + "SELECT<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = " + lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += indent(2) + "FROM <br/>";
		output += indent(4) + recordName + " <br/>";
		output += indent(2) + "WHERE <br/>"
		output += indent(4) + lowerCaseFirstLetter(recordName) + "Id = @" + lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
	}
	output += indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";

	output += indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
	output += indent(4) + "SELECT @returnMsg = 'Failed to delete " + splitWord(recordName) + ". " + splitWord(recordName) + " does not exist.'<br/>";
	output += indent(4) + "RETURN 1<br/>";
	output += indent(2) + "END<br/><br/>";

	output += indent(2) + "/*Do reference check before deleting the record. */<br/><br/>"

	output += indent(2) + "IF (@returnCode > 0) BEGIN<br/>";
	output += indent(4) + "SELECT @returnMsg = 'Cannot delete " + splitWord(recordName) + ". " + splitWord(recordName) + " has dependencies.'<br/>";
	output += indent(4) + "RETURN 1<br/>";
	output += indent(2) + "END</br></br>";

	output += indent(2) + "DELETE FROM<br/>";
	output += indent(4) + recordName + "<br/>";
	output += indent(2) + "WHERE<br/>";
	output += indent(4) + lowerCaseFirstLetter(recordName) + "Id = @" + lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
	output += indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";
	output += indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
	output += indent(4) + "SELECT @returnMsg = 'Failed to delete " + splitWord(recordName) + ".'<br/>";
	output += indent(4) + "RETURN 1<br/>";
	output += indent(2) + "END<br/><br/>";
	output += indent(2) + "SELECT @returnMsg = 'Successfully deleted " + splitWord(recordName) + ".'<br/><br/>";
	output += indent(2) + "RETURN 0<br/>"
	output += "END<br/>GO<br/>"
	return output;
}

function generateUpdateTableSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "BEGIN TRAN<br/><br/>";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += "IF (EXISTS (SELECT id FROM sysobjects WHERE id = object_id('" + recordName + "') AND type = 'U')) BEGIN<br/>";
		output += indent(2) + "IF (NOT EXISTS (SELECT id FROM syscolumns WHERE id = object_id('" + recordName + "') AND name = '" + lowerCaseFirstLetter(row.cells[0].innerHTML) + "')) BEGIN<br/>";
		output += indent(4) + "ALTER TABLE " + recordName + " ADD ";
		output += lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " " + row.cells[4].innerHTML + "<br/>";
		output += indent(2) + "END<br/>";
		output += "END<br/>";
		output += "GO<br/><br/>";
	}
	output += "COMMIT<br/>";
	output += "GO<br/>";
	return output;
}

function generateSPUpdateSql() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = "<br/>";
	output += "--$Revision$<br/><br/>";
	output += "CREATE PROCEDURE update" + recordName + "<br/>(<br/>";
	output += indent(2) + "@" + lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0),<br/>";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(2) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + ",<br/>";
	}
	output += indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
	output += ") AS BEGIN<br/><br/>";
	output += indent(2) + "BEGIN TRY<br/>";
	output += indent(4) + "DECLARE @returnCode INTEGER<br/><br/>";

	if (rowCount > 1) {

		output += indent(4) + "SELECT<br/>";
		output += indent(6) + "@returnCode = COUNT(*)<br/>";
		output += indent(4) + "FROM<br/>";
		output += indent(6) + recordName + "<br/>";
		output += indent(4) + "WHERE<br/>";
		output += indent(6) + lowerCaseFirstLetter(recordName) + "Id <> @" + lowerCaseFirstLetter(recordName) + "Id";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			if (rowIndex == 1) {
				output += " AND<br/>";
			}
			var row = table.rows[rowIndex];
			output += indent(6) + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += " AND<br/>";
			}
		}
		output += "<br/><br/>";
		output += indent(4) + "IF (@returnCode > 0) BEGIN<br/>";
		output += indent(6) + "SET @returnMsg = 'Unable to update " + splitWord(recordName) + ", " + splitWord(recordName) + " already EXISTS on another id.'<br/>";
		output += indent(6) + "RETURN 1<br/>"
		output += indent(4) + "END<br/><br/>";
		output += indent(4) + "BEGIN TRANSACTION<br/><br/>";
		output += indent(4) + "UPDATE<br/>";
		output += indent(6) + recordName + "<br/>";
		output += indent(4) + "SET<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(6) + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += indent(4) + "WHERE<br/>";
		output += indent(6) + lowerCaseFirstLetter(recordName) + "Id = @" + lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
		output += indent(4) + "COMMIT TRANSACTION<br/>";
		output += indent(4) + "SELECT @returnMsg = 'Successfully updated " + splitWord(recordName) + ".'<br/>";
		output += indent(2) + "END TRY<br/><br/>";
		output += indent(2) + "BEGIN CATCH<br/>";
		output += indent(4) + "SELECT @returnMsg = 'Failed to update " + splitWord(recordName) + " [' + CONVERT (VARCHAR, ERROR_NUMBER()) + '] [' + CONVERT (VARCHAR, ERROR_STATE()) + '] [' + ERROR_MESSAGE() + '].'<br/>";
		output += indent(4) + "IF @@TRANCOUNT > 0 BEGIN<br/>";
		output += indent(6) + "ROLLBACK TRANSACTION<br/>";
		output += indent(4) + "END<br/>";
		output += indent(4) + "IF (ERROR_NUMBER() IN (1205,1222)) BEGIN<br/>";
		output += indent(6) + "RETURN ERROR_NUMBER() * -1<br/>";
		output += indent(4) + "END ELSE BEGIN<br/>";
		output += indent(6) + "RETURN -1<br/>";
		output += indent(4) + "END<br/>";
		output += indent(2) + "END CATCH<br/><br/>"
	}
	output += indent(2) + "RETURN 0<br/>"
	output += "END<br/>GO<br/>"
	return output;
}

function generateJSONRecordCode() {
	var output = messageDefinitionToJson();
	var jsonImporter = document.getElementById("jsonImporter");
	jsonImporter.value = vkbeautify.json(output);
}

function minifyJSONRecordCode() {
	var output = messageDefinitionToJson();
	var jsonImporter = document.getElementById("jsonImporter");
	jsonImporter.value = vkbeautify.jsonmin(output);
}

function messageDefinitionToJson() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var output = "[";
	var rowCount = table.rows.length;
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += "{";
		output += "\"name\":\"" + row.cells[0].innerHTML + "\",";
		output += "\"type\":\"" + row.cells[1].innerHTML + "\",";
		output += "\"javaType\":\"" + row.cells[2].innerHTML + "\",";
		output += "\"size\":\"" + row.cells[3].innerHTML + "\",";
		output += "\"nullable\":\"" + row.cells[4].innerHTML + "\"}";
		if (rowIndex < rowCount - 1) {
			output += ","
		}
	}
	output += "]"
	return output;
}

function getSqlType(type, size) {
	if (type == "SMALLINT" || type == "TINYINT" || type == "BIGINT" || type == "INTEGER" || type == "DATE" || type == "DATETIME" || type == "BIT" || type == "TEXT" || type == "IMAGE") {
		return type;
	} else {
		return type + "(" + size + ")";
	}
}

function jsonToMessageDefinition(jsonText) {
	clearMessageDefinitionTable();
	var jsonVar = JSON.parse(jsonText);
	if (jsonVar) {
		var rowCount = jsonVar.length;
		for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			addRowFields(jsonVar[rowIndex].name, jsonVar[rowIndex].type, jsonVar[rowIndex].javaType, jsonVar[rowIndex].size, jsonVar[rowIndex].nullable);
		}
	}
  var table = document.getElementById("messageDefinitionTable");
  //sorttable.makeSortable(table);
}

function importJSON() {
	var jsonText = document.getElementById("jsonImporter").value;
	jsonToMessageDefinition(jsonText);
	reloadAll();
	showDialog("infoDialog");
}

function clearMessageDefinitionTable() {
	var table = document.getElementById("messageDefinitionTable");
	var output = "\"" + recordName + "\":{<br/>";
	var rowCount = table.rows.length;
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		table.deleteRow(-1);
	}
}

function getStorage() {
	var storage = window.localStorage;
	if (!storage) {
		storage = localStorage;
	}
	return storage;
}

function loadFromLocalStorage(listName, filter, replace) {
	var storage = getStorage();
	if (storage) {
		var messageDefinitionList = document.getElementById(listName);
		for (var i = messageDefinitionList.options.length - 1; i >= 0; i--) {
			messageDefinitionList.remove(i);
		}
		var option = document.createElement("option");
		option.text = "";
		option.value = "";
		messageDefinitionList.add(option);
		for (var key in storage) {
			var option = document.createElement("option");
			option.text = key;
      if ("|key|getItem|setItem|removeItem|clear|length|".indexOf(key) < 0){
        option.value = key;
        if (filter && filter.length > 0) {
          if (key.indexOf(filter) > -1) {
            if (replace && replace.toUpperCase() == "TRUE") {
              option.text = option.text.replace(filter, "");
            }
            messageDefinitionList.add(option);
          }
        } else {
          messageDefinitionList.add(option);
        }
      }
		}
	}
	logQueryString(queryString);
}

function saveMessageDefinition() {
	var storage = getStorage();
	if (storage) {
		var recordName = getTableName();
		storage.setItem(recordName, messageDefinitionToJson());
		loadFromLocalStorage("messageDefinitionList");
	} else {}
}

function storeRule(rule) {}

function removeSelectedMessageDefinition() {
	var responseButton = document.getElementById("IamSureButton");
	if (responseButton.removeEventListener) {
		responseButton.removeEventListener("click", responseFunction);
	}
	var messageDefinitionList = document.getElementById("messageDefinitionList");
	var selectedItem = messageDefinitionList.options[messageDefinitionList.selectedIndex].value;
	var recordName = selectedItem;
	responseFunction = function () {
		removeMessageDefinition(recordName);
		closeDialog("areYouSureDialog");
	};
	var areYouSureMessage = document.getElementById("areYouSureMessage");
	areYouSureMessage.innerHTML = "Do you want to delete <b>" + recordName + "</b> from local storage?";
	responseButton.addEventListener("click", responseFunction);
	showDialog("areYouSureDialog");
}

function removeMessageDefinition(recordName) {
	var storage = window.localStorage;
	if (!storage) {
		storage = localStorage;
	}
	if (storage) {
		storage.removeItem(recordName);
		loadFromLocalStorage("messageDefinitionList");
	}
}

function retrieveMessageDefinition() {
	var storage = window.localStorage;
	if (!storage) {
		storage = localStorage;
	}
	if (storage) {
		var messageDefinitionList = document.getElementById("messageDefinitionList");
		var selectedItem = messageDefinitionList.options[messageDefinitionList.selectedIndex].value;
		var recordName = capitalizeFirstLetter(selectedItem);
		document.getElementById("recordName").value = recordName;
		var output = storage.getItem(recordName);
		jsonToMessageDefinition(output);
		reloadAll();
	}
}

function log(entry) {
	var logger = document.getElementById("loggerTable");
	if (entry && logger) {
		if (logger.length > 100) {
			clearLog();
		}
		var row = logger.insertRow(-1);
		row.insertCell(0).textContent = entry;
	}
}

function clearLog() {
	var logger = document.getElementById("loggerTable");
	if (logger) {
		logger.textContent = "";
	}
}

function loadSQL(sqlFunction) {
	if (sqlFunction) {
		var output = sqlFunction();
		var spSQL = document.getElementById("sqlViewerText");
		spSQL.innerHTML = applySQLColor(output);
	}
}

function reloadSQL() {
	generateTCsql();
	generateSPCreateSql();
	generateSPUpdateSql();
	generateSPRetrieveSql();
	generateSPSearchSql();
	generateSPListSql();
	generateSPDeleteSql();
	generateUpdateTableSql();
}

function reloadAll() {
	loadSQL(generateTCsql);
	generateJavaAdaptor();
	generateXsdTypes(false);
	generateJSONRecordCode();
}

function showContentPane(menuOption) {
	var contentPaneList = document.getElementsByClassName("contentPane");
	for (var i = 0; i < contentPaneList.length; i++) {
		contentPaneList[i].style.display = "none";
	}
	document.getElementById(menuOption).style.display = "block";
}

function editField(thisRow) {
	if (thisRow) {
		currentRow = thisRow;
		showFieldEditor(thisRow)
	}
}

function showFieldEditor(thisRow) {
	currentRow = thisRow.parentNode.parentNode;
	if (currentRow) {
		document.getElementById("editor_fieldName").value = currentRow.cells[0].innerHTML;
		document.getElementById("editor_fieldType").value = currentRow.cells[1].innerHTML;
		document.getElementById("editor_fieldSize").value = currentRow.cells[3].innerHTML;
		document.getElementById("editor_nullable").value = currentRow.cells[4].innerHTML;
	}
	showDialog("fieldEditorDialog");
}

function saveFieldEditor() {
	if (currentRow) {
		currentRow.cells[0].innerHTML = document.getElementById("editor_fieldName").value;
		currentRow.cells[1].innerHTML = document.getElementById("editor_fieldType").options[document.getElementById("editor_fieldType").selectedIndex].value;
		currentRow.cells[2].innerHTML = getJavaType(document.getElementById("editor_fieldType").options[document.getElementById("editor_fieldType").selectedIndex].value);
		currentRow.cells[3].innerHTML = document.getElementById("editor_fieldSize").value;
		currentRow.cells[4].innerHTML = document.getElementById("editor_nullable").value;
	}
	closeDialog("fieldEditorDialog");
}

function makeJsonObject(inputString){
  inputString = inputString.replace("\{","");
  inputString = inputString.replace("\}","");
  var jsonString = "";
  var properties = inputString.split(",");
  if (properties && properties.length > 0){
    jsonString += "{";
    for (var i = 0; i < properties.length; i++){
      var property = properties[i].split(":");
      if (property && property.length == 2){
        if (i > 0){
          jsonString +=",";
        }
        jsonString += "\""+property[0]+"\":\""+property[1]+"\"";
      }
    }
    jsonString += "}";
  }
  return JSON.parse(jsonString);
}
function showDialog(dialogId, dialogOptionsJSON) {
	document.getElementById(dialogId).style.display = "block";
	if (dialogOptionsJSON) {
    var dialogOptions = makeJsonObject(dialogOptionsJSON);
    if (dialogOptions){
      if (dialogOptions.content){
        document.getElementById(dialogId + "Content").innerHTML = "<br/>" + dialogOptions.content + "<br/>";
      }
      if (dialogOptions.title){
        document.getElementById(dialogId + "Title").innerHTML =  dialogOptions.title;
      }
    }
	}
}

function closeDialog(dialogId) {
	document.getElementById(dialogId).style.display = "none";
}

function importTCText() {
	var tcImportText = customCleanup(document.getElementById("tcImportText").value);
  tcImportText = replaceAll(tcImportText, "\t"," ");
	log(tcImportText);
	var tableNameRegex = /create table\s+\w+/ig;
	var tableName = tcImportText.match(tableNameRegex)[0].split(" ")[2];
	log("table name : " + tableName);

	var fieldsRegex = /\w+\s+(uniqueidentifier|numeric|float|smallint|tinyint|varchar|char|text|bit|int|bigint|integer|character|date|decimal|datetime|time|timestamp|image)(.+)(NULL|NOT NULL)/ig;
	var fields = tcImportText.match(fieldsRegex);

	var result = "[";

	var size = fields.length;
	for (var i = 0; i < size; i++) {
		result += importFieldText(fields[i]);
		if (i < size - 1) {
			result += ",";
		}
	}
	result += "]";
	log(result);
	document.getElementById("recordName").value = tableName.trim();
	document.getElementById("jsonImporter").value = result;
	importJSON();
	showDialog("infoDialog");
}

function formatImportTCText() {
	var tcImportText = document.getElementById("tcImportText");
	tcImportText.value = formatSQL(tcImportText.value);
}

function clearImportTCText() {
	document.getElementById("tcImportText").value = "";
}

function importFieldText(fieldLine) {
	fieldLine = fieldLine.replace(/numeric\(\w+,\s+\w+\)/ig, "numeric(20)");
	fieldLine = fieldLine.replace(/IDENTITY\(1,1\)/ig, "");
	log(" -- " + fieldLine);
	var result = ""
		if (fieldLine) {
			var fieldLineArray = fieldLine.split(" ");
			if (fieldLineArray.length == 3) {
				var fieldType = fieldLineArray[1];
				result += "{\"name\":\"" + importFieldName(fieldLineArray[0]) + "\",";
				result += "\"type\":\"" + importFieldType(fieldType) + "\",";
				result += "\"javaType\":\"" + importFieldJavaType(fieldType) + "\",";
				result += "\"size\":\"" + importFieldSize(fieldType) + "\",";
				result += "\"nullable\":\"NULL\"";
				result += "}";
			} else if (fieldLineArray.length >= 4) {
				var fieldType = fieldLineArray[1];
				result += "{\"name\":\"" + importFieldName(fieldLineArray[0]) + "\",";
				result += "\"type\":\"" + importFieldType(fieldType) + "\",";
				result += "\"javaType\":\"" + importFieldJavaType(fieldType) + "\",";
				result += "\"size\":\"" + importFieldSize(fieldType) + "\",";
				result += "\"nullable\":\"NOT NULL\"";
				result += "}";
			}
		}
		return result;
}

function importFieldName(fieldName) {
	return fieldName.replace("(", "").trim();
}
function importFieldType(fieldType) {
	var matches = fieldType.match("(\\w+)");
	return toLongSqlTypeFormat(matches[0].toUpperCase());
}

function importFieldJavaType(fieldType) {
	var matches = fieldType.match("(\\w+)");
	return getJavaType(matches[0].toUpperCase());
}

function importFieldSize(fieldType) {
	var matches = fieldType.replace("(", ",").replace(")", "").split(",");
	var result = "";
	if (matches.length == 2) {
		result += matches[1];
	} else if (matches.length == 1) {
		result += 5;
	}
	return result;
}

function importFieldNullable(fieldType) {
	var matches = fieldType.match("(\\w+)");
	return matches[0];
}

function toLongSqlTypeFormat(sqlType) {
	if (sqlType == "INT") {
		return "INTEGER";
	} else if (sqlType == "CHAR") {
		return "CHARACTER";
	} else {
		return sqlType;
	}
}

function customCleanup(originalString) {
	originalString = originalString.replace(/\[TRES\]\.|\[dbo\]\./ig, "");
	originalString = originalString.replace(/\[/ig, "");
	originalString = originalString.replace(/\]/ig, "");

	return originalString;
}

function applySQLColor(text) {
	var searchFor = /\buniqueidentifier\b|\binteger\b|\bnumeric\b|\bvarchar\b|\bcharacter\b|\bdate\b|\bdatetime\b|\btimestamp\b|\bnull\b/ig;
	var replaceWith = "<b class=\"blue\">$&</b>";
	text = text.replace(searchFor, replaceWith);

	searchFor = /\bcreate\b|\btable\b|\bprocedure\b|\bas\b|\bbegin\b|\bdeclare\b|\bselect\b|\bfrom\b|\bwhere\b|\bif\b|\bend\b|\belse\b|\bupdate\b|\bdelete\b|\binsert\b|\binto\b|\bvalues\b|\bset\b|\bnot\b|\band\b|\bor\b|\bcommit\b|\brollback\b/ig;
	replaceWith = "<b class=\"red\">$&</b>";
	text = text.replace(searchFor, replaceWith);

	searchFor = /\bgo\b|\bidentity\b/ig;
	replaceWith = "<b class=\"green\">$&</b>";
	text = text.replace(searchFor, replaceWith);

	searchFor = /\breturn\b|\bALTER\b|\bEXISTS\b|\bADD\b/ig;
	replaceWith = "<b class=\"black\">$&</b>";
	text = text.replace(searchFor, replaceWith);

	searchFor = /'([^'])+'/ig;
	replaceWith = "<b class=\"green\">$&</b>";
	text = text.replace(searchFor, replaceWith);

	return text;
}

function applyJavaColor(text) {
	var searchFor = /\bprivate\b|\bprotected\b|\bpublic\b|\bstatic\b|\bfinal\b|\bvoid\b|\bclass\b|\bextends\b|\bimplements\b|\bif\b|\belse\b|\"([^\"])+\"/ig;
	var replaceWith = "<b class='red'>$&</b>";
	text = text.replace(searchFor, replaceWith);

	searchFor = /\bint\b|\binteger\b|\bdouble\b|\bbyte\b|\bstring\b|\blong\b|\bbigDecimal\b|\bCalendar\b|\bthis\.|\breturn\b/ig;
	replaceWith = "<b class='blue'>$&</b>";
	text = text.replace(searchFor, replaceWith);

	searchFor = /({)|(})/ig;
	replaceWith = "<b class='green'>$&</b>";
	text = text.replace(searchFor, replaceWith);

	return text;
}

function applyXsdColor(text) {
	var searchFor = /xs:element/ig;
	var replaceWith = "<b class='red'>$&</b>";
	text = text.replace(searchFor, replaceWith);
	return text;
}

function splitWord(word) {
	var newWord = word.replace(/([A-Z]+)/g, ",$1").replace(/^,/, "");
	var wordList = newWord.split(",");
	var sentence = "";
	if (wordList && wordList.length > 0) {
		for (var i = 0; i < wordList.length; i++) {
			sentence += wordList[i] + " ";
		}
	} else {
		sentence = word;
	}
	return sentence.trim();
}

function openItemList(columnNo) {
	var table = document.getElementById("messageDefinitionTable");
	var recordName = getTableName();
	var rowCount = table.rows.length;
	var output = "";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		output += table.rows[rowIndex].cells[columnNo].innerHTML + "\n";
	}
	document.getElementById("listDialogTitle").innerHTML = recordName + " ( " + (rowCount - 1) + " fields )";
	document.getElementById("listDialogItems").value = output;
	showDialog("listDialog");
}

function loadUsage(usageType) {
	var output = "";
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	if (usageType == "create") {
    output = declareVariables();
		output += indent(2) + "EXEC @returnCode = create" + recordName + "<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML);
			output += ",<br/>";
		}
		output += indent(4) + "@returnMsg = @returnMsg OUTPUT";
	} else if (usageType == "update") {
    output = declareVariables();
		output += indent(2) + "EXEC @returnCode = update" + recordName + "<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML);
			output += ",<br/>";
		}
		output += indent(4) + "@returnMsg = @returnMsg OUTPUT";

	} else if (usageType == "retrieve") {
    output = declareVariables();
		output += indent(2) + "EXEC @returnCode = retrieve" + recordName + "<br/>";
		output += indent(4) + "@" + lowerCaseFirstLetter(recordName) + "Id = @" + lowerCaseFirstLetter(recordName) + "Id,<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " OUTPUT";
			output += ",<br/>";
		}
		output += indent(4) + "@returnMsg = @returnMsg OUTPUT";
	} else if (usageType == "search") {
    output = declareVariables();
		output += indent(2) + "EXEC @returnCode = search" + recordName + "<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + lowerCaseFirstLetter(row.cells[0].innerHTML);
			output += ",<br/>";
		}
		output += indent(4) + "@returnMsg = @returnMsg OUTPUT";

	} else if (usageType == "delete") {
		output += indent(2) + "EXEC @returnCode = delete" + recordName + "<br/>";
		output += indent(4) + "@" + lowerCaseFirstLetter(recordName) + "Id = @" + lowerCaseFirstLetter(recordName) + "Id,<br/>";
		output += indent(4) + "@returnMsg = @returnMsg OUTPUT";

	} else if (usageType == "list") {
		output += indent(2) + "EXEC @returnCode = list" + recordName + "<br/>";

	}

	var spSQL = document.getElementById("sqlViewerText");
	spSQL.innerHTML = output;
}

function declareVariables() {
	var recordName = getTableName();
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
	var output = indent(2) + "DECLARE <br/>";
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var row = table.rows[rowIndex];
		output += indent(4) + "@" + lowerCaseFirstLetter(row.cells[0].innerHTML) + "  " + getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML);
		if (rowIndex < rowCount - 1) {
			output += ",<br/>";
		}
	}
	return output + "<br/>";
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

function htmlDecode(input) {
	var e = document.createElement('div');
	e.innerHTML = input;
	return e.childNodes[0].nodeValue;
}

function loadJsonDocument(docUrl, resultContainer) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      document.getElementById(resultContainer).innerHTML = xhttp.responseText;
    }
  };
  xhttp.open("GET", docUrl, true);
  xhttp.send();
}

function showCodeMerge(){
 
	var table = document.getElementById("messageDefinitionTable");
	var rowCount = table.rows.length;
  var mergeList = document.getElementById("codeMergeList");
  for (var i = mergeList.options.length - 1; i >= 0; i--) {
		mergeList.remove(i);
	}
	for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
		var option = document.createElement("option");
		option.text = table.rows[rowIndex].cells[0].innerHTML;
		option.value = table.rows[rowIndex].cells[0].innerHTML;
		mergeList.add(option);
	}
  showDialog('codeMergeDiv');
}

function mergeCode(){
  var mergeList = document.getElementById("codeMergeList");
  var mergeTemplate = document.getElementById("codeMergeTemplate").value;
  var mergeResult = document.getElementById("codeMergeResult");
  var output = "";
  var lastIndex = mergeList.options.length;
  for (var i = 0; i < lastIndex; i++) {
		if (mergeList.options[i].selected == true){
      output += applyTemplate(mergeTemplate,mergeList.options[i].text)+"\n";
    }
	}
  mergeResult.value = output;
}

function applyTemplate(template, value){
  return replaceAll(template,"$",value);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}