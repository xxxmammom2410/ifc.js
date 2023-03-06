import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { IFCWALLSTANDARDCASE } from 'web-ifc';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc(url) {
		// Load the model
    const model = await viewer.IFC.loadIfcUrl(url);

		// Add dropped shadow and post-processing efect
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;

    // エレメントタイプを指定してジオメトリリストを取得
    const walls = await viewer.IFC.getAllItemsOfType(model.modelID, IFCWALLSTANDARDCASE, true);
    console.dir(walls) ;
    const table = document.getElementById('walls-table');
    const tableBody = table.querySelector('tbody');
    //IFCWALLSTANDARDCASEの数だけテーブルデータを作成 
    for(const wall of walls) {
        createWallNameEntry(tableBody, wall);
        //IFCWALLSTANDARDCASEが持つキーの数だけテーブルデータを作成 
        for(let propertyName in wall) {
            const propertyValue = wall[propertyName];
            addPropertyEntry(tableBody, propertyName, propertyValue);
        }
    }
}


function createWallNameEntry(table, wall) {
  const row = document.createElement('tr');
  table.appendChild(row);

  const wallName = document.createElement('td');
  wallName.colSpan = 2;
  // テーブルデータにWallジオメトリの名前を入力
  wallName.textContent = 'Wall ' + wall.GlobalId.value;
  row.appendChild(wallName);
}

function addPropertyEntry(table, name, value) {
  const row = document.createElement('tr');
  table.appendChild(row);

  const propertyName = document.createElement('td');
  name = decodeIFCString(name);
  propertyName.textContent = name;
  row.appendChild(propertyName);

  if(value === null || value === undefined) value = "Unknown";
  if(value.value) value = value.value;
  value = decodeIFCString(value);

  const propertyValue = document.createElement('td');
  propertyValue.textContent = value;
  row.appendChild(propertyValue);
}

function decodeIFCString (ifcString) {
  // "\\X2\\57FA672C5899\\X0\\:\\X2\\84284F0F4F0A522B58854E005C4258994F532014\\X0\\240mm:239142"
  // Muro b\X2\00E1\X0\sico:Partici\X2\00F3\X0\n con capa de yeso:163541
  
  //\X2\(文字列)\X0\  全てにマッチ unicodeでの\X2\を表す
  
  const ifcUnicodeRegEx = /\\X2\\(.*?)\\X0\\/ig;
  let resultString = ifcString;
  let match = ifcUnicodeRegEx.exec (ifcString);
  while (match) {
    console.log(match)
      //(文字列)を16進数から10進数に変換してunicodeのコードポイントに変換したものをデコード
      const unicodePart = parseInt (match[1], 16);
      
      let uFormChar = '\"\\u' + match[1].match(/.{4}/g).join('\\u') + "\"";
      console.log("uFormCharの値は"+uFormChar);
      let unicodeChar = decodeURIComponent(JSON.parse(uFormChar));

      //\X2\(文字列)\X0\ を置き換える(文字列)を 
      resultString = resultString.replace (match[0], unicodeChar);
      // マッチパターンを次のインデックスへ進める
      match = ifcUnicodeRegEx.exec (ifcString);
  }
  return resultString;
}

// テーブル要素をエクセルに書き出すイベントをバインド
const exportButton = document.getElementById('export');
exportButton.onclick = () => {
  const table = document.getElementById('walls-table');
    const book = XLSX.utils.table_to_book(table);
    XLSX.writeFile(book, "Walls_Table.xlsx");
 }

loadIfc('../../../models/_ifc/04.ifc');