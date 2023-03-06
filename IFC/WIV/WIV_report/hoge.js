
const ifcUnicodeRegEx = /\\X2\\(.*?)\\X0\\/uig;
let resultString = ifcString;
let match = ifcUnicodeRegEx.exec (ifcString);
while (match) {
  console.log(match)
    //(文字列)を16進数から10進数に変換してunicodeのコードポイントに変換したものをデコード
    const unicodePart = parseInt (match[1], 16);
    
    let unicodeChar = "";
    
    const utf16BufferRegEx= /([^\u \l]...)/g;
    let utf16Buffer =utf16BufferRegEx.exec(unicodePart) ;
    while(utf16Buffer){
      const nextChar = String.fromCharCode (parseInt (utf16Buffer[1], 16));
      unicodeChar = unicodeChar.concat("",nextChar);
    }

    // const unicodeChar = String.fromCharCode (parseInt (match[1], 16));

    //\X2\(文字列)\X0\ を置き換える(文字列)を 
    resultString = resultString.replace (match[0], unicodeChar);
    match = ifcUnicodeRegEx.exec (ifcString);
}
return resultString;