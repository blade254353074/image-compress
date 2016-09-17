;(function () {
  var file
  var fileType
  var url
  var compressedImageDataURL
  var compressSuccess = false
  var contentType // 从 canvas.toDataURL 的结果中获取的 contentType
  var binaryString // atob 转码后的 二进制文本 
  var boundary = 'customFileboundary'
  var boundaryString // 构造为 multipart 的文本
  var arrayBuffer // 需要用 ajax 发送的 ArrayBuffer

  function asyncClick (doms, i) {
    setTimeout(function () {
      if (i < doms.length) {
        doms[i++].click()
        asyncClick(doms, i)
      }
    }, 50)
  }

  function autoClick () {
    asyncClick([
      J_GetImageFile,
      J_LoadImageByURL,
      J_DrawImage,
      J_CompressImage,
      J_Atob,
      J_ConcatBinaryStirng,
      J_String2ArrayBuffer
    ], 0)
  }

  // file on change
  J_File.addEventListener('change', function (e) {
    if (e.target.value) {
      J_GetImageFile.removeAttribute('disabled')
    } else {
      J_GetImageFile.setAttribute('disabled', true)
    }
    // autoClick() // Test
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

  // get file directly
  J_GetLenaFile.addEventListener('click', function (e) {
    var button

    if (e.target && e.target.nodeName === 'BUTTON') {
      var fileName
      button = e.target
      url = button.getAttribute('data-url')
      fileName = url.substr(url.lastIndexOf('/') + 1)

      getFile(url + '?t=' + (new Date()).valueOf(), function (err, res) {
        if (err) {
          return alert(err)
        }
        file = {
          name: fileName,
          size: res.contentLength,
          type: res.contentType
        }
        fileType = res.contentType
        J_ImageObject.innerText = [
          'file.name: ' + fileName,
          'file.type: ' + fileType,
          'file.size: ' + file.size
        ].join('\r\n')
      })

      // reset
      J_ImageObject.innerText = ''
      J_Image.removeAttribute('src')
      J_ImageCanvas.getContext('2d').clearRect(0, 0, J_ImageCanvas.width, J_ImageCanvas.height)
      J_ImageCanvas.width = 300
      J_ImageCanvas.height = 150
      setTimeout(function () {
        J_Image.src = url
        J_ImageURL.innerText = url
      }, 0)
    }
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
    setTimeout(function () {
      J_Image.src = url
      J_ImageURL.innerText = url
    }, 0)
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
    var quality = J_CompressQuality.value
    var compressedBlob


    J_MimeType.innerText = ''
    J_CompressedImageDataURL.innerText = ''
    J_SourceFileSize.innerText = ''
    J_CompressedFileSize.innerText = ''
    J_CompressedImage.removeAttribute('src')

    compressedImageDataURL = canvas.toDataURL(mimeType, quality / 100)
    compressedBlob = dataURL2Blob(compressedImageDataURL)

    setTimeout(function () {
      J_MimeType.innerText = mimeType
      J_CompressedImageDataURL.innerText = compressedImageDataURL
      J_SourceFileSize.innerText = file.size
      J_CompressedFileSize.innerText = compressedBlob.size
      J_CompressedImage.src = compressedImageDataURL
      J_Atob.removeAttribute('disabled')
      J_XHRBlobMultiparty.removeAttribute('disabled')
      J_XHRBlobMulter.removeAttribute('disabled')
    }, 0)

    if (compressedBlob.size > file.size) {
      // Compressed file size > Original file size
      console.log(compressedBlob.size + ' > ' + file.size)
      return
    }
    compressSuccess = true
  })
  
  // atob
  J_Atob.addEventListener('click', function () {
    // 不包含 /^data:image\/(.+);base64,/ 的 base64 字符串
    var pureBase64ImageData = compressedImageDataURL.replace(/^data:(image\/.+);base64,/, function ($0, $1) {
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
    arrayBuffer = string2ArrayBuffer(boundaryString)

    J_ArrayBuffer.innerText = arrayBuffer
    J_XHRMultiparty.removeAttribute('disabled')
    J_XHRMulter.removeAttribute('disabled')
  })
  
  function sendArrayBuffer (url) {
    return function () {
      var button = this
      var buttonText = this.innerText
      var xhr = new XMLHttpRequest()
      xhr.withCredentials = true
      xhr.open('POST', url, true)
      xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)

      xhr.upload.addEventListener('progress', function (e) {
        var progress
        if (e.lengthComputable) {
          progress = (e.loaded / e.total * 100).toFixed(2)
          button.innerText = progress + '%'
        }
      })
      xhr.addEventListener('load', function () {
        if (
          xhr.status >= 200 && xhr.status < 300 ||
          xhr.status == 304
        ) {
          J_UploadResult_XHR.innerText = '--- SUCCESS ---\n' + JSON.stringify(JSON.parse(xhr.responseText), null, 2)
        } else {
          J_UploadResult_XHR.innerText =
            '--- ERROR: ' + xhr.status + ' ---\n' + JSON.stringify(JSON.parse(xhr.responseText), null, 2)
        }
        button.innerText = buttonText
        button.removeAttribute('disabled')
      })

      button.setAttribute('disabled', 'true')
      xhr.send(arrayBuffer)
    }
  }

  // use XMLHttpRequest send Array Buffer
  J_XHRMultiparty.addEventListener('click', sendArrayBuffer('/api/upload/multiparty'))
  J_XHRMulter.addEventListener('click', sendArrayBuffer('/api/upload/multer'))

  function sendBlob (url) {
    return function () {
      var button = this
      var buttonText = this.innerText
      var formData = new FormData()
      var xhr = new XMLHttpRequest()
      var blobFile = dataURL2Blob(compressedImageDataURL)

      formData.append('file', blobFile, file.name)

      xhr.open('POST', url, true)
      xhr.withCredentials = true

      xhr.upload.addEventListener('progress', function (e) {
        var progress
        if (e.lengthComputable) {
          progress = (e.loaded / e.total * 100).toFixed(2)
          button.innerText = progress + '%'
        }
      })
      xhr.addEventListener('load', function () {
        if (
          xhr.status >= 200 && xhr.status < 300 ||
          xhr.status == 304
        ) {
          J_UploadResult_XHRBlob.innerText = '--- SUCCESS ---\n' + JSON.stringify(JSON.parse(xhr.responseText), null, 2)
        } else {
          J_UploadResult_XHRBlob.innerText =
            '--- ERROR: ' + xhr.status + ' ---\n' + JSON.stringify(JSON.parse(xhr.responseText), null, 2)
        }
        button.innerText = buttonText
        button.removeAttribute('disabled')
      })
      
      button.setAttribute('disabled', 'true')
      xhr.send(formData)
    }
  }

  // use XMLHttpRequest & FormData send blob
  J_XHRBlobMultiparty.addEventListener('click', sendBlob('/api/upload/multiparty'))
  J_XHRBlobMulter.addEventListener('click', sendBlob('/api/upload/multer'))
}())
