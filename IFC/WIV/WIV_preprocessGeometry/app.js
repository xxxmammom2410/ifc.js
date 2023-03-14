import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

// 変換する対象IFCカテゴリをインポート
import {
  IFCWALL,
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCWINDOW,
  IFCMEMBER,
  IFCPLATE,
  IFCCURTAINWALL,
  IFCDOOR,
  IFCFLOWFITTING,
  IFCFLOWSEGMENT,
  IFCFLOWTERMINAL,
  IFCBUILDINGELEMENTPROXY
} from 'web-ifc';





const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();





// async function loadIfc(event) {
async function loadIfc(url) {
  // 入力したファイルを取得
  // const file = event.target.files[0];
  // const url = URL.createObjectURL(file);

  // Export to glTF and JSON
  const result = await viewer.GLTF.exportIfcFileAsGltf({
    ifcFileUrl: url,
    splitByFloors: true,
    categories: {
      walls: [IFCWALL, IFCWALLSTANDARDCASE],
      slabs: [IFCSLAB],
      windows: [IFCWINDOW],
      curtainwalls: [IFCMEMBER, IFCPLATE, IFCCURTAINWALL],
      doors: [IFCDOOR],
      pipes: [IFCFLOWFITTING, IFCFLOWSEGMENT, IFCFLOWTERMINAL],
      undefined: [IFCBUILDINGELEMENTPROXY]
    },
    getProperties: true
  });

  // Download result
  const link = document.createElement('a');
  document.body.appendChild(link);

  console.dir(result);

  var count = 0;
  // 出力したjsonをそれぞれダウンロード
  for (const jsonFile of result.json) {
    link.download = `${jsonFile.name}.json`;
    // link.download = 'properties.json';
    link.href = URL.createObjectURL(jsonFile);
    link.click();
    ++count

  }

  let promises = []

  // ループの途中 最後のundefinedが実行されない
  // safariだとundefinedF3しかダウンロードしない
  // 出力したgltfのカテゴリ名の数だけ
  for (const categoryName in result.gltf) {


    const category = result.gltf[categoryName];

    // カテゴリ内の階高ごとにダウンロード
    for (const levelName in category) {

      const file = category[levelName].file;
      if (file) {
        // 一時停止することで最後のカテゴリもダウンロードできる
        // debugger
        // setTimeout(function(){
        console.log("%cFile_Existed", 'color:blue')
        console.log(`%c${file.name}_${categoryName}_${levelName}`, 'color:blue')
        promises.push(download(link, file, categoryName, levelName));

        if (++count >= 10) {
          await pause(1000);
          count = 0;
        }

        // link.download = `${file.name}_${categoryName}_${levelName}.gltf`;
        // link.href = URL.createObjectURL(file);
        // link.click();



        // },1000)

      }
    }
  }

  async function download(_link, _file, _categoryName, _levelName) {
    return new Promise((resolve, reject) => {
      _link.download = `${_file.name}_${_categoryName}_${_levelName}.gltf`;
      _link.href = URL.createObjectURL(_file);
      _link.click();
      URL.revokeObjectURL(_link.href)
      console.log("Downloaded");
      return resolve(_categoryName);
    })
  }

  Promise.all(promises).then(() => {
    // 実行を待ってから処理
    link.remove();
  }).then(() => {
    console.log("All Downloaded")
  })
}

function pause(msec) {
  console.log("%cpause called", 'color:red')
  return new Promise(
    (resolve, reject) => {
      setTimeout(resolve, msec || 1000);
    }
  );
}




loadIfc('../../../models/_ifc/04.ifc');
