import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "app.js",// bundleするエントリーポイントを設定
  output: [
    {
      format: "cjs",
      file: "bundle.js",
    },
  ],
  plugins: [resolve()],

}