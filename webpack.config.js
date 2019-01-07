module.exports = {
	output: {
		filename: 'main.js'
	},
	mode:'development',
	module: {
		rules: [
			{
				test: /\.(frag|vert)$/,
				use: 'raw-loader'
			}
		]
	}
};