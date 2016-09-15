function $ (selector) {
  return document.querySelector(selector)
}
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

(function () {
  var file
  var fileType
  var url
  var compressedImageDataURL
  var compressSuccess = false
  var contentType // 从 canvas.toDataURL 的结果中获取的 contentType
  var pureBase64ImageData // 不包含 /^data:image\/(.+);base64,/ 的 base64 字符串
  var binaryString // atob 转码后的 二进制文本 
  var boundaryString // 构造为 multipart 的文本

  // file on change
  J_File.addEventListener('change', function (e) {
    if (e.target.value) {
      J_GetImageFile.removeAttribute('disabled')
    } else {
      J_GetImageFile.setAttribute('disabled', true)
    }
  })

  // get file
  J_GetImageFile.addEventListener('click', function () {
    file = J_File.files[0]
    fileType = file.type || 'image/' + name.substr(name.lastIndexOf('.') + 1)
    J_ImageObject.innerText = [
      'file.name: ' + file.name,
      'file.type: ' + file.type,
      'file.size: ' + file.size
    ].join('\r\n')
    J_LoadImageByURL.removeAttribute('disabled')
    J_LoadImageByFileReader.removeAttribute('disabled')
  })

  // image load
  J_Image.addEventListener('load', function () {
    J_DrawImage.removeAttribute('disabled')
  })

  J_Image.addEventListener('error', function () {
    alert('image load error')
  })

  // get dataURL/BlobURL
  // URL
  J_LoadImageByURL.addEventListener('click', function () {
    if (url) {
      window.URL.revokeObjectURL(url)
    }
    url = window.URL.createObjectURL(file)

    J_Image.removeAttribute('src')
    J_Image.src = url
    J_ImageURL.innerText = url
  })
  // FileReader
  J_LoadImageByFileReader.addEventListener('click', function () {
    var fileReader = new FileReader()

    J_Image.removeAttribute('src')
    fileReader.addEventListener('load', function (e) {
      var dataURL = e.target.result
      J_Image.src = dataURL
      J_ImageURL.innerText = dataURL
    })
    fileReader.readAsDataURL(file)
  })

  // drawImage to canvas
  J_DrawImage.addEventListener('click', function () {
    var sourceImage = J_Image
    var canvas = J_ImageCanvas
    var context = canvas.getContext('2d')

    if (!isCanvasBlank(canvas)) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
    canvas.width = sourceImage.naturalWidth
    canvas.height = sourceImage.naturalHeight
    context.drawImage(sourceImage, 0, 0)

    J_CompressImage.removeAttribute('disabled')
  })

  J_CompressImage.addEventListener('click', function () {
    /*
    * HTMLCanvasElement.toDataURL() 不支持传入的类型非“image/png”，
    * 但是值以“data:image/png”开头的类型。
    */
    var canvas = J_ImageCanvas
    var mimeType = fileType || 'image/png'
    var quality = 30
    var compressedBlob

    compressedImageDataURL = canvas.toDataURL(mimeType, quality / 100)
    compressedBlob = dataURL2Blob(compressedImageDataURL)

    J_MimeType.innerText = mimeType
    J_CompressedImageDataURL.innerText = compressedImageDataURL
    J_SourceFileSize.innerText = file.size
    J_CompressedFileSize.innerText = compressedBlob.size
    J_Atob.removeAttribute('disabled')
    
    if (compressedBlob.size > file.size) {
      // 文件压缩后，比原文件大
      console.log(compressedBlob.size + ' > '  + file.size)
      return
    }
    compressSuccess = true
  })

  // atob
  J_Atob.addEventListener('click', function () {
    pureBase64ImageData = compressedImageDataURL.replace(/^data:(image\/.+);base64,/, function ($0, $1) {
      contentType = $1
      return ''
    })
    // atob
    binaryString = atob(pureBase64ImageData)

    J_PureBase64Data.innerText = pureBase64ImageData
    J_ContentType.innerText = contentType
    J_BinaryString.innerText = binaryString
    J_ConcatBinaryStirng.removeAttribute('disabled')
  })

  J_ConcatBinaryStirng.addEventListener('click', function () {
    var boundary = 'customFileboundary'
    boundaryString = [
      '--' + boundary,
      'Content-Disposition: form-data; name="file"; filename="' + (file.name || 'blob') + '"',
      'Content-Type: ' + contentType,
      '', binaryString,
      '--' + boundary + '--', ''
    ].join('\r\n')

    J_MultipartBinaryString.innerText = boundaryString
    J_String2ArrayBuffer.removeAttribute('disabled')
  })

  J_String2ArrayBuffer.addEventListener('click', function () {
    var stringBuffer = string2ArrayBuffer(boundaryString)
    J_ArrayBuffer.innerText = stringBuffer
  })
}())
