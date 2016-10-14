entitygenerator = {} || entitygenerator;

entitygenerator.QueryString = function () {
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
};
var queryString = new entitygenerator.QueryString();

entitygenerator.Utilities = function (){
  return {
    capitalizeFirstLetter : function (string) {
      if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      return string;
    },
    
    lowerCaseFirstLetter : function (string) {
      return string.charAt(0).toLowerCase() + string.slice(1);
    },
    
    indent : function (indentCount) {
      var indentString = "";
      for (var i = 0; i < indentCount; i++) {
        indentString += "\u00a0";
      }
      return indentString;
    },
    
    splitWord : function (word) {
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
    },
    
    getXsdBaseType : function (type) {
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
    },

    getJavaType : function (type) {
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
    },
    
  	getSqlType : function (type, size) {
      if (type == "SMALLINT" || type == "TINYINT" || type == "BIGINT" || type == "INTEGER" || type == "DATE" || type == "DATETIME" || type == "BIT" || type == "TEXT" || type == "IMAGE") {
        return type;
      } else {
        return type + "(" + size + ")";
		}
	}

    
  }
};

var utilities = new entitygenerator.Utilities();

utilities.getTableName = function () {
  var tableName = utilities.capitalizeFirstLetter(document.getElementById("recordName").value);
  if (tableName && tableName.length > 0) {
    return tableName;
  }
  return "Example";
}

utilities.declareVariables = function () {
  var recordName = utilities.getTableName();
  var table = document.getElementById("messageDefinitionTable");
  var rowCount = table.rows.length;
  var output = utilities.indent(2) + "DECLARE <br/>";
  for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    var row = table.rows[rowIndex];
    output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + "  " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML);
    if (rowIndex < rowCount - 1) {
      output += ",<br/>";
    }
  }
  return output + "<br/>";
}


entitygenerator.EntityGenerator = function () {
	this.currentRow;
	this.responseFunction;

  
	this.logQueryString = function () {
		if (queryString) {
			this.log("query string : " + JSON.stringify(queryString));
		}
	}




	this.addRow = function () {
		var fieldName = document.getElementById("fieldName").value;
		var fieldType = document.getElementById("fieldType").options[document.getElementById("fieldType").selectedIndex].text;
		var javaType = utilities.getJavaType(fieldType);
		var fieldSize = document.getElementById("fieldSize").value;
		var nullable = document.getElementById("nullableList").options[document.getElementById("nullableList").selectedIndex].value;
		this.addRowFields(fieldName, fieldType, javaType, fieldSize, nullable);
	}

	this.addRowFields = function (fieldName, fieldType, javaType, fieldSize, nullable) {
		var table = document.getElementById("messageDefinitionTable").getElementsByTagName("tbody")[0];
		if (fieldName.length > 0 && fieldSize.length > 0) {
			var row = table.insertRow(-1);
			row.insertCell(0).innerHTML = fieldName;
			row.insertCell(1).innerHTML = fieldType;
			row.insertCell(2).innerHTML = javaType;
			row.insertCell(3).innerHTML = fieldSize;
			row.insertCell(4).innerHTML = nullable;
			row.insertCell(5).innerHTML = this.addRowActions(); //+ addSortActions()
		}
	}

	this.addRowActions = function () {
		var output = "";
		output += "&nbsp;&nbsp;<input type=\"button\" class=\"editBtn btn\" onclick=\"entityGenerator.editField(this)\" title=\"edit\"/>"; //x
		output += "&nbsp;&nbsp;<input type=\"button\" class=\"deleteBtn btn\" onclick=\"entityGenerator.deleteRow(this)\" title=\"delete\"/>"; //x
		return output;
	}

	this.deleteRow = function (thisRow) {
		var responseButton = document.getElementById("IamSureButton");
		var areYouSureMessage = document.getElementById("areYouSureMessage");
		if (responseButton.removeEventListener) {
			responseButton.removeEventListener("click", responseFunction);
		}
		areYouSureMessage.innerHTML = "Do you want to delete the field <b>" + thisRow.parentNode.parentNode.cells[0].innerHTML + "</b>?";
		responseFunction = function () {
			this.deleteRowFromTable(thisRow);
			Dialog.closeDialog("areYouSureDialog");
		};
		responseButton.addEventListener("click", responseFunction);
		Dialog.showDialog("areYouSureDialog");
	}

	this.deleteRowFromTable = function (thisRow) {
		if (thisRow) {
			var p = thisRow.parentNode.parentNode;
			p.parentNode.removeChild(p);
		}
	}


	this.createCommonVariables = function () {
		var output = "";
		output += utilities.indent(2) + "private static final long serialVersionUID = 1L;<br/>";
		return output;
	}

	this.createVariables = function () {
		var table = document.getElementById("messageDefinitionTable");
		var recordName = utilities.getTableName();
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += utilities.indent(2) + "protected BigDecimal " + utilities.lowerCaseFirstLetter(recordName) + "Id;<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + "protected " + row.cells[2].innerHTML + " " + row.cells[0].innerHTML + ";<br/>";
		}
		output += "<br/>";
		return output;
	}

	this.createConstructors = function () {
		var recordName = utilities.getTableName();
		var output = utilities.indent(2) + "public " + recordName + "Adaptor() {<br/>";
		output += utilities.indent(2) + "}<br/><br/>";
		return output;
	}

	this.createVariableAccessors = function () {
		var table = document.getElementById("messageDefinitionTable");
		var recordName = utilities.getTableName();
		var rowCount = table.rows.length;
		var output = "";

		output += utilities.indent(2) + "public void set" + utilities.capitalizeFirstLetter(recordName) + "Id(BigDecimal " + utilities.lowerCaseFirstLetter(recordName) + "Id) {<br/>";
		output += utilities.indent(4) + "this." + utilities.lowerCaseFirstLetter(recordName) + "Id = " + utilities.lowerCaseFirstLetter(recordName) + "Id;<br/>";
		output += utilities.indent(2) + "}<br/><br/>";
		output += utilities.indent(2) + "public BigDecimal get" + utilities.capitalizeFirstLetter(recordName) + "Id(){<br/>";
		output += utilities.indent(4) + "return " + utilities.lowerCaseFirstLetter(recordName) + "Id;<br/>";
		output += utilities.indent(2) + "}<br/><br/>";

		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + "public " + row.cells[2].innerHTML + " get" + utilities.capitalizeFirstLetter(row.cells[0].innerHTML) + "(){<br/>";
			output += utilities.indent(4) + "return " + row.cells[0].innerHTML + ";<br/>";
			output += utilities.indent(2) + "}<br/><br/>";
			output += utilities.indent(2) + "public void set" + utilities.capitalizeFirstLetter(row.cells[0].innerHTML) + "(" + row.cells[2].innerHTML + " " + row.cells[0].innerHTML + ") {<br/>";
			output += utilities.indent(4) + "this." + row.cells[0].innerHTML + " = " + row.cells[0].innerHTML + ";<br/>";
			output += utilities.indent(2) + "}<br/><br/>";
		}
		output += "<br/>";
		return output;
	}

	this.generateXsdTypes = function (minify) {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var generatedCode = document.getElementById("xsdTypes");
		var output = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>";
		output += "<xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" elementFormDefault=\"qualified\" attributeFormDefault=\"unqualified\">";

		output += "<xs:element name=\"" + utilities.lowerCaseFirstLetter(recordName) + "\" type=\"" + recordName + "Type\"/>";

		output += "<xs:complexType name=\"" + recordName + "Type\">";
		output += "<xs:sequence>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			var type = utilities.getXsdBaseType(row.cells[1].innerHTML);
			output += "<xs:element name=\"";
			output += utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
			output += "\" minOccurs=\"1\">";
			output += "<xs:simpleType>";
			output += "<xs:restriction base=\"xs:" + type + "\">";
			if (type == "integer") {
				output += "<xs:totalDigits value=\"" + row.cells[3].innerHTML + "\"/>";
			} else if (type != "date") {
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
		this.log(docString);
		if (minify == true) {
			generatedCode.textContent = vkbeautify.xmlmin(docString);
		} else {
			generatedCode.textContent = docString;
		}
	}

	this.minifyXsdTypes = function () {
		this.generateXsdTypes(true);
	}

	this.generateJavaAdaptor = function () {
		var recordName = utilities.getTableName();
		var output = "public class " + recordName + "Adaptor extends DataRecord {<br/>";
		var generatedCode = document.getElementById("generatedCode");
		output += this.createCommonVariables();
		output += this.createVariables();
		output += this.createConstructors();
		output += this.createVariableAccessors();
		output += "}<br/><br/>";
		generatedCode.innerHTML = this.applyJavaColor(output);
	}

	this.generateJavaXsdToAdaptor = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "";
		var generatedCode = document.getElementById("generatedCode");
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + utilities.lowerCaseFirstLetter(recordName) + "Adaptor.set" + utilities.capitalizeFirstLetter(row.cells[0].innerHTML);
			output += "(" + utilities.lowerCaseFirstLetter(recordName) + ".get" + utilities.capitalizeFirstLetter(row.cells[0].innerHTML) + "());<br/>";
		}
		generatedCode.innerHTML = this.applyJavaColor(output);
	}

	this.generateJavaAdaptorToXsd = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "";
		var generatedCode = document.getElementById("generatedCode");
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + utilities.lowerCaseFirstLetter(recordName) + ".set" + utilities.capitalizeFirstLetter(row.cells[0].innerHTML);
			output += "(" + utilities.lowerCaseFirstLetter(recordName) + "Adaptor.get" + utilities.capitalizeFirstLetter(row.cells[0].innerHTML) + "());<br/>";
		}
		generatedCode.innerHTML = this.applyJavaColor(output);
	}

	this.generateTCsql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "SET ANSI_PADDING ON<br/>";
		output += "GO<br/><br/>";
		output += "CREATE TABLE " + recordName + " (<br/>";
		output += utilities.indent(2) + utilities.lowerCaseFirstLetter(recordName) + "Id NUMERIC(20,0) IDENTITY(1,1) NOT NULL";

		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			if (rowIndex == 1) {
				output += ",<br/>";
			}
			output += utilities.indent(2) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " " + row.cells[4].innerHTML;
			if (rowIndex < rowCount - 1) {
				output += ",<br/>"
			}

		}
		output += "<br/>)<br/>";
		output += "<br/>GO"
		return output;
	}

	this.generateSPCreateSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "CREATE PROCEDURE create" + recordName + "<br/>(<br/>";
		output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0) OUTPUT,";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			if (rowIndex == 1) {
				output += "<br/>"
			}
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " = NULL";
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
			if (rowIndex == rowCount - 1) {
				output += ",";
			}
		}
		output += "<br/>";
		output += utilities.indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
		output += ") AS BEGIN<br/><br/>";
		output += utilities.indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
		if (rowCount > 1) {
			output += utilities.indent(2) + "SELECT<br/>";
			output += utilities.indent(4) + "@returnCode = COUNT(*)<br/>";
			output += utilities.indent(2) + "FROM<br/>";
			output += utilities.indent(4) + recordName + " <br/>";
			output += utilities.indent(2) + "WHERE <br/>"
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " ";
				if (rowIndex < rowCount - 1) {
					output += " AND <br/>";
				}
			}
		}
		output += "<br/><br/>";
		output += utilities.indent(2) + "IF (@returnCode > 0) BEGIN<br/>";
		output += utilities.indent(4) + "SET @returnMsg = 'Unable to create " + utilities.splitWord(recordName) + ", a " + utilities.splitWord(recordName) + " already EXISTS with the code supplied.'<br/>";
		output += utilities.indent(4) + "RETURN 1<br/>";
		output += utilities.indent(2) + "END<br/><br/>";
		if (rowCount > 1) {
			output += utilities.indent(2) + "INSERT INTO<br/>";
			output += utilities.indent(4) + recordName + "<br/>";
			output += utilities.indent(2) + "(<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				if (rowIndex < rowCount - 1) {
					output += ",<br/>";
				}
			}
			output += "<br/>";
			output += utilities.indent(2) + ") VALUES (<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				if (rowIndex < rowCount - 1) {
					output += ",<br/>";
				}
			}
			output += "<br/>";
			output += utilities.indent(2) + ")<br/><br/>";
		}
		output += utilities.indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";
		output += utilities.indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
		output += utilities.indent(4) + "SELECT @returnMsg = 'Failed to create/insert " + utilities.splitWord(recordName) + ".'<br/>";
		output += utilities.indent(4) + "RETURN 1<br/>";
		output += utilities.indent(2) + "END<br/><br/>";
		output += utilities.indent(2) + "SELECT @" + utilities.lowerCaseFirstLetter(recordName) + "Id = @@IDENTITY<br/>";
		output += utilities.indent(2) + "SELECT @returnMsg = 'Successfully created " + utilities.splitWord(recordName) + ".'<br/>";
		output += utilities.indent(2) + "RETURN 0<br/>"
		output += "END<br/>GO<br/>"
		return output;
	}

	this.generateSPRetrieveSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "CREATE PROCEDURE retrieve" + recordName + "<br/>(<br/>";
		output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0) OUTPUT,<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " OUTPUT,<br/>";
		}
		output += utilities.indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
		output += ") AS BEGIN<br/><br/>";
		output += utilities.indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
		output += utilities.indent(2) + "SELECT<br/>";
		output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id = " + utilities.lowerCaseFirstLetter(recordName) + "Id";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			if (rowIndex == 1) {
				output += ",<br/>";
			}
			output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = " + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += utilities.indent(2) + "FROM<br/>";
		output += utilities.indent(4) + recordName + "<br/>";
		output += utilities.indent(2) + "WHERE<br/>";
		output += utilities.indent(4) + utilities.lowerCaseFirstLetter(recordName) + "Id = @" + utilities.lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
		output += utilities.indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";
		output += utilities.indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
		output += utilities.indent(4) + "SELECT @returnMsg = 'Failed to retrieve " + utilities.splitWord(recordName) + ".'<br/>";
		output += utilities.indent(4) + "RETURN 1<br/>";
		output += utilities.indent(2) + "END<br/><br/>";
		output += utilities.indent(2) + "SELECT @returnMsg = 'Successfully retrieved " + utilities.splitWord(recordName) + ".'<br/><br/>";
		output += utilities.indent(2) + "RETURN 0<br/>"
		output += "END<br/>GO<br/>"
		return output;
	}

	this.generateSPSearchSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "CREATE PROCEDURE search" + recordName + "<br/>(<br/>";
		output += utilities.indent(2) + "@batchSize INTEGER";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			if (rowIndex == 1) {
				output += ",<br/>";
			}
			output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += ",<br/>";
		output += utilities.indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
		output += ") AS BEGIN<br/><br/>";
		output += utilities.indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
		output += utilities.indent(2) + "IF (@batchSize = -1) BEGIN<br/>";
		output += utilities.indent(4) + "SET rowcount 0<br/>";
		output += utilities.indent(2) + "END ELSE BEGIN<br/>";
		output += utilities.indent(4) + "SET rowcount @batchSize<br/>";
		output += utilities.indent(2) + "END<br/><br/>";
		if (rowCount > 1) {
			output += utilities.indent(2) + "SELECT<br/>";
			output += utilities.indent(4) + utilities.lowerCaseFirstLetter(recordName) + "Id";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				if (rowIndex == 1) {
					output += ",<br/>";
				}
				output += utilities.indent(4) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				if (rowIndex < rowCount - 1) {
					output += ",<br/>";
				}
			}
			output += "<br/>";
			output += utilities.indent(2) + "FROM<br/>";
			output += utilities.indent(4) + recordName + "<br/>";
			output += utilities.indent(2) + "WHERE<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];

				var sqlType = row.cells[1].innerHTML;
				if (sqlType == "VARCHAR" || sqlType == "CHARACTER") {
					output += utilities.indent(4) + "(";
					output += "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " IS NULL OR ";
					output += utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " LIKE '%' + @";
					output += utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " + '%'";
					output += ")";
				} else {
					output += utilities.indent(4) + "(";
					output += "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " IS NULL OR ";
					output += utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @";
					output += utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
					output += ")";
				}
				output += " AND<br/>";
			}
			output += utilities.indent(4) + "(@batchSize <> 0)";
			output += "<br/><br/>";
		}
		output += utilities.indent(2) + "SELECT @returnMsg = 'Successfully searched " + utilities.splitWord(recordName) + "'<br/>";
		output += utilities.indent(2) + "RETURN 0<br/>"
		output += "END<br/>GO<br/>"
		return output;
	}

	this.generateSPListSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "CREATE PROCEDURE list" + recordName + " <br/>";
		output += "AS BEGIN<br/><br/>";
		output += utilities.indent(2) + "SELECT<br/>";
		output += utilities.indent(4) + utilities.lowerCaseFirstLetter(recordName) + "Id";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			if (rowIndex == 1) {
				output += ",<br/>";
			}
			output += utilities.indent(4) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
			if (rowIndex < rowCount - 1) {
				output += ",<br/>";
			}
		}
		output += "<br/>";
		output += utilities.indent(2) + "FROM<br/>";
		output += utilities.indent(4) + recordName + "<br/><br/>";
		output += utilities.indent(2) + "RETURN 0<br/>"
		output += "END<br/>GO<br/>"
		return output;
	}

	this.generateSPDeleteSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "CREATE PROCEDURE delete" + recordName + "<br/>(<br/>";
		output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0),<br/>";
		output += utilities.indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
		output += ") AS BEGIN<br/><br/>";
		output += utilities.indent(2) + "DECLARE @returnCode INTEGER<br/><br/>";
		if (rowCount > 1) {
			output += utilities.declareVariables();
			output += "<br/>";
		}

		if (rowCount > 1) {
			output += utilities.indent(2) + "SELECT<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = " + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				if (rowIndex < rowCount - 1) {
					output += ",<br/>";
				}
			}
			output += "<br/>";
			output += utilities.indent(2) + "FROM <br/>";
			output += utilities.indent(4) + recordName + " <br/>";
			output += utilities.indent(2) + "WHERE <br/>"
			output += utilities.indent(4) + utilities.lowerCaseFirstLetter(recordName) + "Id = @" + utilities.lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
		}
		output += utilities.indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";

		output += utilities.indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
		output += utilities.indent(4) + "SELECT @returnMsg = 'Failed to delete " + utilities.splitWord(recordName) + ". " + utilities.splitWord(recordName) + " does not exist.'<br/>";
		output += utilities.indent(4) + "RETURN 1<br/>";
		output += utilities.indent(2) + "END<br/><br/>";

		output += utilities.indent(2) + "/*Do reference check before deleting the record. */<br/><br/>"

		output += utilities.indent(2) + "IF (@returnCode > 0) BEGIN<br/>";
		output += utilities.indent(4) + "SELECT @returnMsg = 'Cannot delete " + utilities.splitWord(recordName) + ". " + utilities.splitWord(recordName) + " has dependencies.'<br/>";
		output += utilities.indent(4) + "RETURN 1<br/>";
		output += utilities.indent(2) + "END</br></br>";

		output += utilities.indent(2) + "DELETE FROM<br/>";
		output += utilities.indent(4) + recordName + "<br/>";
		output += utilities.indent(2) + "WHERE<br/>";
		output += utilities.indent(4) + utilities.lowerCaseFirstLetter(recordName) + "Id = @" + utilities.lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
		output += utilities.indent(2) + "SELECT @returnCode = @@ROWCOUNT<br/><br/>";
		output += utilities.indent(2) + "IF (@returnCode = 0) BEGIN<br/>";
		output += utilities.indent(4) + "SELECT @returnMsg = 'Failed to delete " + utilities.splitWord(recordName) + ".'<br/>";
		output += utilities.indent(4) + "RETURN 1<br/>";
		output += utilities.indent(2) + "END<br/><br/>";
		output += utilities.indent(2) + "SELECT @returnMsg = 'Successfully deleted " + utilities.splitWord(recordName) + ".'<br/><br/>";
		output += utilities.indent(2) + "RETURN 0<br/>"
		output += "END<br/>GO<br/>"
		return output;
	}

	this.generateUpdateTableSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "BEGIN TRAN<br/><br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += "IF (EXISTS (SELECT id FROM sysobjects WHERE id = object_id('" + recordName + "') AND type = 'U')) BEGIN<br/>";
			output += utilities.indent(2) + "IF (NOT EXISTS (SELECT id FROM syscolumns WHERE id = object_id('" + recordName + "') AND name = '" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + "')) BEGIN<br/>";
			output += utilities.indent(4) + "ALTER TABLE " + recordName + " ADD ";
			output += utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + " " + row.cells[4].innerHTML + "<br/>";
			output += utilities.indent(2) + "END<br/>";
			output += "END<br/>";
			output += "GO<br/><br/>";
		}
		output += "COMMIT<br/>";
		output += "GO<br/>";
		return output;
	}

	this.generateSPUpdateSql = function () {
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		var output = "<br/>";
		output += "--$Revision$<br/><br/>";
		output += "CREATE PROCEDURE update" + recordName + "<br/>(<br/>";
		output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id NUMERIC (20,0),<br/>";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			var row = table.rows[rowIndex];
			output += utilities.indent(2) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " " + utilities.getSqlType(row.cells[1].innerHTML, row.cells[3].innerHTML) + ",<br/>";
		}
		output += utilities.indent(2) + "@returnMsg VARCHAR (255) OUTPUT<br/>";
		output += ") AS BEGIN<br/><br/>";
		output += utilities.indent(2) + "BEGIN TRY<br/>";
		output += utilities.indent(4) + "DECLARE @returnCode INTEGER<br/><br/>";

		if (rowCount > 1) {

			output += utilities.indent(4) + "SELECT<br/>";
			output += utilities.indent(6) + "@returnCode = COUNT(*)<br/>";
			output += utilities.indent(4) + "FROM<br/>";
			output += utilities.indent(6) + recordName + "<br/>";
			output += utilities.indent(4) + "WHERE<br/>";
			output += utilities.indent(6) + utilities.lowerCaseFirstLetter(recordName) + "Id <> @" + utilities.lowerCaseFirstLetter(recordName) + "Id";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				if (rowIndex == 1) {
					output += " AND<br/>";
				}
				var row = table.rows[rowIndex];
				output += utilities.indent(6) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				if (rowIndex < rowCount - 1) {
					output += " AND<br/>";
				}
			}
			output += "<br/><br/>";
			output += utilities.indent(4) + "IF (@returnCode > 0) BEGIN<br/>";
			output += utilities.indent(6) + "SET @returnMsg = 'Unable to update " + utilities.splitWord(recordName) + ", " + utilities.splitWord(recordName) + " already EXISTS on another id.'<br/>";
			output += utilities.indent(6) + "RETURN 1<br/>"
			output += utilities.indent(4) + "END<br/><br/>";
			output += utilities.indent(4) + "BEGIN TRANSACTION<br/><br/>";
			output += utilities.indent(4) + "UPDATE<br/>";
			output += utilities.indent(6) + recordName + "<br/>";
			output += utilities.indent(4) + "SET<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(6) + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				if (rowIndex < rowCount - 1) {
					output += ",<br/>";
				}
			}
			output += "<br/>";
			output += utilities.indent(4) + "WHERE<br/>";
			output += utilities.indent(6) + utilities.lowerCaseFirstLetter(recordName) + "Id = @" + utilities.lowerCaseFirstLetter(recordName) + "Id<br/><br/>";
			output += utilities.indent(4) + "COMMIT TRANSACTION<br/>";
			output += utilities.indent(4) + "SELECT @returnMsg = 'Successfully updated " + utilities.splitWord(recordName) + ".'<br/>";
			output += utilities.indent(2) + "END TRY<br/><br/>";
			output += utilities.indent(2) + "BEGIN CATCH<br/>";
			output += utilities.indent(4) + "SELECT @returnMsg = 'Failed to update " + utilities.splitWord(recordName) + " [' + CONVERT (VARCHAR, ERROR_NUMBER()) + '] [' + CONVERT (VARCHAR, ERROR_STATE()) + '] [' + ERROR_MESSAGE() + '].'<br/>";
			output += utilities.indent(4) + "IF @@TRANCOUNT > 0 BEGIN<br/>";
			output += utilities.indent(6) + "ROLLBACK TRANSACTION<br/>";
			output += utilities.indent(4) + "END<br/>";
			output += utilities.indent(4) + "IF (ERROR_NUMBER() IN (1205,1222)) BEGIN<br/>";
			output += utilities.indent(6) + "RETURN ERROR_NUMBER() * -1<br/>";
			output += utilities.indent(4) + "END ELSE BEGIN<br/>";
			output += utilities.indent(6) + "RETURN -1<br/>";
			output += utilities.indent(4) + "END<br/>";
			output += utilities.indent(2) + "END CATCH<br/><br/>"
		}
		output += utilities.indent(2) + "RETURN 0<br/>"
		output += "END<br/>GO<br/>"
		return output;
	}

	this.generateJSONRecordCode = function () {
		var output = this.messageDefinitionToJson();
		var jsonImporter = document.getElementById("jsonImporter");
		jsonImporter.value = vkbeautify.json(output);
	}

	this.minifyJSONRecordCode = function () {
		var output = this.messageDefinitionToJson();
		var jsonImporter = document.getElementById("jsonImporter");
		jsonImporter.value = vkbeautify.jsonmin(output);
	}

	this.messageDefinitionToJson = function () {
		var recordName = utilities.getTableName();
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

	this.jsonToMessageDefinition = function (jsonText) {
		this.clearMessageDefinitionTable();
		var jsonVar = JSON.parse(jsonText);
		if (jsonVar) {
			var rowCount = jsonVar.length;
			for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				this.addRowFields(jsonVar[rowIndex].name, jsonVar[rowIndex].type, jsonVar[rowIndex].javaType, jsonVar[rowIndex].size, jsonVar[rowIndex].nullable);
			}
		}
		var table = document.getElementById("messageDefinitionTable");
	}

	this.importJSON  = function () {
		var jsonText = document.getElementById("jsonImporter").value;
		this.jsonToMessageDefinition(jsonText);
		this.reloadAll();
		Dialog.showDialog("infoDialog");
	}

	this.clearMessageDefinitionTable = function () {
		var table = document.getElementById("messageDefinitionTable");
		var output = "\"" + recordName + "\":{<br/>";
		var rowCount = table.rows.length;
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			table.deleteRow(-1);
		}
	}

	this.getStorage = function () {
		var storage = window.localStorage;
		if (!storage) {
			storage = localStorage;
		}
		return storage;
	}

	this.loadFromLocalStorage = function (listName, filter, replace) {
		var storage = this.getStorage();
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
				if ("|key|getItem|setItem|removeItem|clear|length|".indexOf(key) < 0) {
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
		this.logQueryString(queryString);
	}

	this.saveMessageDefinition = function () {
		var storage = this.getStorage();
		if (storage) {
			var recordName = utilities.getTableName();
			storage.setItem(recordName, this.messageDefinitionToJson());
			loadFromLocalStorage("messageDefinitionList");
		} else {}
	}

	this.removeSelectedMessageDefinition = function () {
		var responseButton = document.getElementById("IamSureButton");
		if (responseButton.removeEventListener) {
			responseButton.removeEventListener("click", responseFunction);
		}
		var messageDefinitionList = document.getElementById("messageDefinitionList");
		var selectedItem = messageDefinitionList.options[messageDefinitionList.selectedIndex].value;
		var recordName = selectedItem;
		responseFunction = function () {
			this.removeMessageDefinition(recordName);
			Dialog.closeDialog("areYouSureDialog");
		};
		var areYouSureMessage = document.getElementById("areYouSureMessage");
		areYouSureMessage.innerHTML = "Do you want to delete <b>" + recordName + "</b> from local storage?";
		responseButton.addEventListener("click", responseFunction);
		Dialog.showDialog("areYouSureDialog");
	}

	this.removeMessageDefinition = function (recordName) {
		var storage = window.localStorage;
		if (!storage) {
			storage = localStorage;
		}
		if (storage) {
			storage.removeItem(recordName);
			loadFromLocalStorage("messageDefinitionList");
		}
	}

	this.retrieveMessageDefinition = function () {
		var storage = window.localStorage;
		if (!storage) {
			storage = localStorage;
		}
		if (storage) {
			var messageDefinitionList = document.getElementById("messageDefinitionList");
			var selectedItem = messageDefinitionList.options[messageDefinitionList.selectedIndex].value;
			var recordName = utilities.capitalizeFirstLetter(selectedItem);
			document.getElementById("recordName").value = recordName;
			var output = storage.getItem(recordName);
			this.jsonToMessageDefinition(output);
			this.reloadAll();
		}
	}

	this.log = function (entry) {
		var logger = document.getElementById("loggerTable");
		if (entry && logger) {
			if (logger.length > 100) {
				this.clearLog();
			}
			var row = logger.insertRow(-1);
			row.insertCell(0).textContent = entry;
		}
	}

	this.clearLog = function () {
		var logger = document.getElementById("loggerTable");
		if (logger) {
			logger.textContent = "";
		}
	}

	this.loadSQL = function (sqlFunction) {
		if (sqlFunction) {
			var output = sqlFunction.apply();
			var spSQL = document.getElementById("sqlViewerText");
			spSQL.innerHTML = this.applySQLColor(output);
		}
	}

	this.reloadSQL = function () {
		this.generateTCsql();
		this.generateSPCreateSql();
		this.generateSPUpdateSql();
		this.generateSPRetrieveSql();
		this.generateSPSearchSql();
		this.generateSPListSql();
		this.generateSPDeleteSql();
		this.generateUpdateTableSql();
	}

	this.reloadAll = function () {
		this.loadSQL(this.generateTCsql);
		this.generateJavaAdaptor();
		this.generateXsdTypes(false);
		this.generateJSONRecordCode();
	}

  /*
	this.showContentPane = function (menuOption) {
		var contentPaneList = document.getElementsByClassName("contentPane");
		for (var i = 0; i < contentPaneList.length; i++) {
			contentPaneList[i].style.display = "none";
		}
		document.getElementById(menuOption).style.display = "block";
	}
  */

	this.editField = function (thisRow) {
		if (thisRow) {
			currentRow = thisRow;
			this.showFieldEditor(thisRow)
		}
	}

	this.showFieldEditor = function (thisRow) {
		currentRow = thisRow.parentNode.parentNode;
		if (currentRow) {
			document.getElementById("editor_fieldName").value = currentRow.cells[0].innerHTML;
			document.getElementById("editor_fieldType").value = currentRow.cells[1].innerHTML;
			document.getElementById("editor_fieldSize").value = currentRow.cells[3].innerHTML;
			document.getElementById("editor_nullable").value = currentRow.cells[4].innerHTML;
		}
		Dialog.showDialog("fieldEditorDialog");
	}

	this.saveFieldEditor = function () {
		if (currentRow) {
			currentRow.cells[0].innerHTML = document.getElementById("editor_fieldName").value;
			currentRow.cells[1].innerHTML = document.getElementById("editor_fieldType").options[document.getElementById("editor_fieldType").selectedIndex].value;
			currentRow.cells[2].innerHTML = utilities.getJavaType(document.getElementById("editor_fieldType").options[document.getElementById("editor_fieldType").selectedIndex].value);
			currentRow.cells[3].innerHTML = document.getElementById("editor_fieldSize").value;
			currentRow.cells[4].innerHTML = document.getElementById("editor_nullable").value;
		}
		Dialog.closeDialog("fieldEditorDialog");
	}

	this.makeJsonObject = function (inputString) {
		inputString = inputString.replace("\{", "");
		inputString = inputString.replace("\}", "");
		var jsonString = "";
		var properties = inputString.split(",");
		if (properties && properties.length > 0) {
			jsonString += "{";
			for (var i = 0; i < properties.length; i++) {
				var property = properties[i].split(":");
				if (property && property.length == 2) {
					if (i > 0) {
						jsonString += ",";
					}
					jsonString += "\"" + property[0] + "\":\"" + property[1] + "\"";
				}
			}
			jsonString += "}";
		}
		return JSON.parse(jsonString);
	}

	this.importTCText = function () {
		var tcImportText = this.customCleanup(document.getElementById("tcImportText").value);
		tcImportText = this.replaceAll(tcImportText, "\t", " ");
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
		this.log(result);
		document.getElementById("recordName").value = tableName.trim();
		document.getElementById("jsonImporter").value = result;
		this.importJSON();
		Dialog.showDialog("infoDialog");
	}

	this.formatImportTCText = function () {
		var tcImportText = document.getElementById("tcImportText");
		tcImportText.value = this.formatSQL(tcImportText.value);
	}

	this.clearImportTCText = function () {
		document.getElementById("tcImportText").value = "";
	}

	this.importFieldText = function (fieldLine) {
		fieldLine = fieldLine.replace(/numeric\(\w+,\s+\w+\)/ig, "numeric(20)");
		fieldLine = fieldLine.replace(/IDENTITY\(1,1\)/ig, "");
		log(" -- " + fieldLine);
		var result = ""
			if (fieldLine) {
				var fieldLineArray = fieldLine.split(" ");
				if (fieldLineArray.length == 3) {
					var fieldType = fieldLineArray[1];
					result += "{\"name\":\"" + this.importFieldName(fieldLineArray[0]) + "\",";
					result += "\"type\":\"" + this.importFieldType(fieldType) + "\",";
					result += "\"javaType\":\"" + this.importFieldJavaType(fieldType) + "\",";
					result += "\"size\":\"" + this.importFieldSize(fieldType) + "\",";
					result += "\"nullable\":\"NULL\"";
					result += "}";
				} else if (fieldLineArray.length >= 4) {
					var fieldType = fieldLineArray[1];
					result += "{\"name\":\"" + this.importFieldName(fieldLineArray[0]) + "\",";
					result += "\"type\":\"" + this.importFieldType(fieldType) + "\",";
					result += "\"javaType\":\"" + this.importFieldJavaType(fieldType) + "\",";
					result += "\"size\":\"" + this.importFieldSize(fieldType) + "\",";
					result += "\"nullable\":\"NOT NULL\"";
					result += "}";
				}
			}
			return result;
	}

	this.importFieldName = function (fieldName) {
		return fieldName.replace("(", "").trim();
	}
  
	this.importFieldType = function (fieldType) {
		var matches = fieldType.match("(\\w+)");
		return this.toLongSqlTypeFormat(matches[0].toUpperCase());
	}

	this.importFieldJavaType = function (fieldType) {
		var matches = fieldType.match("(\\w+)");
		return utilities.getJavaType(matches[0].toUpperCase());
	}

	this.importFieldSize = function (fieldType) {
		var matches = fieldType.replace("(", ",").replace(")", "").split(",");
		var result = "";
		if (matches.length == 2) {
			result += matches[1];
		} else if (matches.length == 1) {
			result += 5;
		}
		return result;
	}

	this.importFieldNullable = function (fieldType) {
		var matches = fieldType.match("(\\w+)");
		return matches[0];
	}

	this.toLongSqlTypeFormat = function (sqlType) {
		if (sqlType == "INT") {
			return "INTEGER";
		} else if (sqlType == "CHAR") {
			return "CHARACTER";
		} else {
			return sqlType;
		}
	}

	this.customCleanup = function (originalString) {
		originalString = originalString.replace(/\[TRES\]\.|\[dbo\]\./ig, "");
		originalString = originalString.replace(/\[/ig, "");
		originalString = originalString.replace(/\]/ig, "");

		return originalString;
	}

	this.applySQLColor = function (text) {
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

	this.applyJavaColor = function (text) {
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

	this.applyXsdColor = function (text) {
		var searchFor = /xs:element/ig;
		var replaceWith = "<b class='red'>$&</b>";
		text = text.replace(searchFor, replaceWith);
		return text;
	}



	this.openItemList = function (columnNo) {
		var table = document.getElementById("messageDefinitionTable");
		var recordName = utilities.getTableName();
		var rowCount = table.rows.length;
		var output = "";
		for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
			output += table.rows[rowIndex].cells[columnNo].innerHTML + "\n";
		}
		document.getElementById("listDialogTitle").innerHTML = recordName + " ( " + (rowCount - 1) + " fields )";
		document.getElementById("listDialogItems").value = output;
		Dialog.showDialog("listDialog");
	}

	this.loadUsage  = function (usageType) {
		var output = "";
		var recordName = utilities.getTableName();
		var table = document.getElementById("messageDefinitionTable");
		var rowCount = table.rows.length;
		if (usageType == "create") {
			output = utilities.declareVariables();
			output += utilities.indent(2) + "EXEC @returnCode = create" + recordName + "<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				output += ",<br/>";
			}
			output += utilities.indent(4) + "@returnMsg = @returnMsg OUTPUT";
		} else if (usageType == "update") {
			output = utilities.declareVariables();
			output += utilities.indent(2) + "EXEC @returnCode = update" + recordName + "<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				output += ",<br/>";
			}
			output += utilities.indent(4) + "@returnMsg = @returnMsg OUTPUT";

		} else if (usageType == "retrieve") {
			output = utilities.declareVariables();
			output += utilities.indent(2) + "EXEC @returnCode = retrieve" + recordName + "<br/>";
			output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id = @" + utilities.lowerCaseFirstLetter(recordName) + "Id,<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " OUTPUT";
				output += ",<br/>";
			}
			output += utilities.indent(4) + "@returnMsg = @returnMsg OUTPUT";
		} else if (usageType == "search") {
			output = utilities.declareVariables();
			output += utilities.indent(2) + "EXEC @returnCode = search" + recordName + "<br/>";
			for (var rowIndex = 1; rowIndex < rowCount; rowIndex++) {
				var row = table.rows[rowIndex];
				output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML) + " = @" + utilities.lowerCaseFirstLetter(row.cells[0].innerHTML);
				output += ",<br/>";
			}
			output += utilities.indent(4) + "@returnMsg = @returnMsg OUTPUT";

		} else if (usageType == "delete") {
			output += utilities.indent(2) + "EXEC @returnCode = delete" + recordName + "<br/>";
			output += utilities.indent(4) + "@" + utilities.lowerCaseFirstLetter(recordName) + "Id = @" + utilities.lowerCaseFirstLetter(recordName) + "Id,<br/>";
			output += utilities.indent(4) + "@returnMsg = @returnMsg OUTPUT";

		} else if (usageType == "list") {
			output += utilities.indent(2) + "EXEC @returnCode = list" + recordName + "<br/>";

		}

		var spSQL = document.getElementById("sqlViewerText");
		spSQL.innerHTML = output;
	}


	this.focusOn = function (elementId) {
		document.getElementById(elementId).focus();
	}

	this.loadJsonDocument  = function (docUrl, resultContainer) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				document.getElementById(resultContainer).innerHTML = xhttp.responseText;
			}
		};
		xhttp.open("GET", docUrl, true);
		xhttp.send();
	}

	this.showCodeMerge = function () {

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
		Dialog.showDialog('codeMergeDiv');
	}

	this.mergeCode = function () {
		var mergeList = document.getElementById("codeMergeList");
		var mergeTemplate = document.getElementById("codeMergeTemplate").value;
		var mergeResult = document.getElementById("codeMergeResult");
		var output = "";
		var lastIndex = mergeList.options.length;
		for (var i = 0; i < lastIndex; i++) {
			if (mergeList.options[i].selected == true) {
				output += this.applyTemplate(mergeTemplate, mergeList.options[i].text) + "\n";
			}
		}
		mergeResult.value = output;
	}

	this.applyTemplate = function (template, value) {
		return this.replaceAll(template, "$", value);
	}

	this.escapeRegExp = function (str) {
		return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}

	this.replaceAll = function (str, find, replace) {
		return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
	}
}
var entityGenerator = new entitygenerator.EntityGenerator();