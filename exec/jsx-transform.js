#!/usr/bin/node

const inline_sourcemap_prefix = '//# sourceMappingURL=data:application/json;base64,'

const fs = require('fs')
const babel = require(`${__dirname}/babel.min`)

function btoa(str) {
	if (Buffer.byteLength(str) !== str.length)
		throw new Error('bad string!')
	return Buffer(str, 'binary').toString('base64')
}

const read_path = path =>
	new Promise((resolve, reject) =>
		fs.readFile(path, (err, data) =>
			err ? reject(err) : resolve(data.toString())))

const write_path = (path, data) =>
	new Promise((resolve, reject) =>
		fs.writeFile(path, data, 'utf8', err =>
			err ? reject(err) : resolve()))

const write_stream = (stream, data) =>
	new Promise((resolve, reject) =>
		stream.write(data, 'utf8', err =>
			err ? reject(err) : resolve()))

const read_stream = (stream, options) => 
	new Promise((resolve, reject) => {
		let content = ''
		stream.resume()
		stream.on('data', buf => content += buf.toString())
		stream.on('error', e => reject(e))
		stream.on('end', () => resolve(content))
	})

const transform_path = (path, options) =>
	new Promise((resolve, reject) =>
		babel.transformFile(path, options, (err, result) =>
			err ? reject(err) : resolve(result)))

async function main(args) {
	const in_filename  = (args.length < 1 || args[0] === '-') ? null : args[0]
	const out_filename = (args.length < 2 || args[1] === '-') ? null : args[1]
	const options = {
		plugins: ['transform-react-jsx', 'syntax-object-rest-spread'],
		sourceMaps: true,
	}
	
	const in_code = await (in_filename === null ? read_stream(process.stdin) : read_path(in_filename))
	const { code, map, ast } = babel.transform(in_code, options)
	const code_and_map = `${code}\n${inline_sourcemap_prefix}${btoa(JSON.stringify(map))}\n`
	
	await (out_filename === null
		? write_stream(process.stdout, code_and_map)
		: write_path(out_filename, code_and_map))
}

main(process.argv.slice(2))
	.then(() => process.exit(0))
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
