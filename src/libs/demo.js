;(function () {
  var file
  var fileType
  var url
  var compressedImageDataURL
  var compressSuccess = false
  var contentType // 从 canvas.toDataURL 的结果中获取的 contentType
  var pureBase64ImageData // 不包含 /^data:image\/(.+);base64,/ 的 base64 字符串
  var binaryString // atob 转码后的 二进制文本 
  var boundary = 'customFileboundary'
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
    var fileName
    file = J_File.files[0]
    fileName = file.name
    fileType = file.type || 'image/' + fileName.substr(fileName.lastIndexOf('.') + 1)
    J_ImageObject.innerText = [
      'file.name: ' + fileName,
      'file.type: ' + fileType,
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
    fileReader.onload = function (e) {
      var dataURL = e.target.result
      J_Image.src = dataURL
      J_ImageURL.innerText = dataURL
    }
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
      console.log(compressedBlob.size + ' > ' + file.size)
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
    J_XHR.removeAttribute('disabled')
    J_XHRBlob.removeAttribute('disabled')
  })

  // use XMLHttpRequest send Array Buffer
  J_XHR.addEventListener('click', function () {
    var xhr = new XMLHttpRequest()

    // xhr.open('POST', 'http://huafeitest.sdhoo.com/api/upload', true)
    xhr.open('POST', 'http://localhost:8080/api/upload/multer', true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)
    xhr.addEventListener('load', function () {
      console.log(arguments)
    })
    xhr.send(boundaryString)
  })

  // use XMLHttpRequest & FormData send blob
  J_XHRBlob.addEventListener('click', function () {
    var fd = new FormData()
    var xhr = new XMLHttpRequest()
    var blobFile = dataURL2Blob(compressedImageDataURL)

    fd.append('file', blobFile, file.name)

    // xhr.open('POST', 'http://huafeitest.sdhoo.com/api/upload', true)
    xhr.open('POST', 'http://localhost:8080/api/upload/multer', true)
    xhr.withCredentials = true
    xhr.addEventListener('load', function () {
      console.log(arguments)
    })
    xhr.send(fd)
  })
}())
