const walk = require('walk')
const oss = require('ali-oss')
const ora = require('ora')
const assert = require('assert')
const path = require('path')
const rc = require('rc')
const CWD = process.cwd()

function getUploadFiles(opts) {
  return new Promise((resolve) => {
    const putDir = path.resolve(CWD, opts.src)
    var walker = walk.walk(putDir);
    var files = []
    var isRegex = false
    var isFunc = typeof opts.ignore === 'function'
    if (typeof opts.ignore === 'string') {
      opts.ignore = new RegExp(opts.ignore)
      isRegex = true
    }
    var ignore = (file) => (isRegex && opts.ignore.test(file)) || (isFunc && opts.ignore(file))

    walker.on('file', (root, fileState, next) => {
      const filePath = path.join(root, fileState.name)
      if (!ignore(filePath)) files.push(filePath)
      next()
    })

    walker.on("end", function () {
      resolve(files)
    })
  })
}

async function aliOSSPut(opts) {
  const ossIns = oss(opts)
  var files = await getUploadFiles(opts)


  var promises = []
  for (let file of files) {
    const target = path.relative(opts.src, file)
    if (opts.silent === false) {
      log(`put file ${file} to oss ${opts.prefix}${target}`)
    }
    let promise = ossIns.put(`${opts.prefix}${target}`, file)
    promises.push(promise)
  }

  var results = await Promise.all(promises)
  if (opts.silent === false) {
    log(results.map(({name, url, res}) => {
      return {name, url, status: res.status}
    }))
  }
}

function log() {
  console.log.apply(null, arguments)
}

module.exports = async function start() {
  var options = rc('aliossput', {
    accessKeyId: null,
    accessKeySecret: null,
    region: null,
    bucket: null,
    prefix: '',
    src: 'dist',
    ignore: null, //function or regex
    silent: true
  })

  assert(options.accessKeyId, 'require oss accessKeyId')
  assert(options.accessKeySecret, 'require oss accessKeySecret')
  assert(options.region, 'require oss region')
  assert(options.bucket, 'require oss bucket')

  const spinner = ora('uploading...').start();

  try {
    await aliOSSPut(options)
    spinner.succeed(`completely upload to bucket ${options.bucket} at region ${options.region}`)
  } catch (e) {
    spinner.succeed(`completely upload to bucket ${options.bucket} at region ${options.region}`)
    throw new Error(e)
  }
}
