import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default{
  input: "app.js",
  output: [
    {
      format: "cjs",
      file: "bundle.js",
    },
  ],
  plugins:[//インポートしたプラグインを使う
    resolve(),
    babel({
      exclude: "node_modules/**",
    })
  ],
}