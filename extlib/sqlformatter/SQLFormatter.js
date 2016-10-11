function formatSQL(sqlText){
  sqlText = sqlText.replace(/\bcreate\b/ig, doSome("$&"));
  return sqlText;
}

function doSome(text){
  return String(text).toUpperCase();
}

