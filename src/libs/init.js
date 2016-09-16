// init
window.URL = window.URL || window.webkitURL

function newBlob (data, datatype) {
  var blob
  try {
    blob = new Blob([data], { type: datatype })
  } catch (e) {
    window.BlobBuilder = window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder

    if (e.name == 'TypeError' && window.BlobBuilder) {
      var blobBuilder = new BlobBuilder()
      blobBuilder.append(data)
      blob = blobBuilder.getBlob(datatype)
    } else if (e.name == 'InvalidStateError') {
      blob = new Blob([data], { type: datatype })
    }
  }
  return blob
}

function isCanvasBlank (canvas) {
  var blank = document.createElement('canvas')
  blank.width = canvas.width
  blank.height = canvas.height

  return canvas.toDataURL() == blank.toDataURL()
}

function newBlob (data, datatype) {
  var out
  try {
    out = new Blob([data], { type: datatype })
  } catch (e) {
    window.BlobBuilder = window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder

    if (e.name == 'TypeError' && window.BlobBuilder) {
      var bb = new BlobBuilder()
      bb.append(data)
      out = bb.getBlob(datatype)
    } else if (e.name == 'InvalidStateError') {
      out = new Blob([data], { type: datatype })
    }
  }
  return out
}

function dataURL2Blob (dataURI) {
  var byteStr
  var intArray
  var ab
  var i
  var mimetype
  var parts

  parts = dataURI.split(',')

  parts[1] = parts[1].replace(/\s/g,'')

  if (~parts[0].indexOf('base64')) {
    byteStr = atob(parts[1])
  } else {
    byteStr = decodeURIComponent(parts[1])
  }

  ab = new ArrayBuffer(byteStr.length)
  intArray = new Uint8Array(ab)

  for (i = 0; i < byteStr.length; i++) {
    intArray[i] = byteStr.charCodeAt(i)
  }

  mimetype = parts[0].split(':')[1].split(';')[0]

  return new Blob([ab], {
    type: mimetype
  })
}

function string2ArrayBuffer (string) {
  var bytes = Array.prototype.map.call(string, function (c) {
    return c.charCodeAt(0) & 0xff
  })
  return new Uint8Array(bytes).buffer
}
