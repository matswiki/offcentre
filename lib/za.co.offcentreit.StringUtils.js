za = {}

 || za
za.co = {}

 || za.co
za.co.offcentreit = {}

 || za.co.offcentreit
za.co.offcentreit.StringUtils = function () {
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

		htmlDecode : function (input) {
			var e = document.createElement('div');
			e.innerHTML = input;
			return e.childNodes[0].nodeValue;
		}

	}
};
