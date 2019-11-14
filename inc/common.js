// var qrtext = '';
var tmppath;
var filePath;
var excelData;
var base64data;
var folderName;
// const ipc = require('electron').ipcRenderer;
// var arithmetic = require('arithmetic');
// arithmetic.add(2, 4);
$(document).ready(function() {
    $("body").children('canvas').remove()
    $('#upload input[type="file"]').change(function(event) {
        var ext = this.value.match(/\.(.+)$/)[1];
        switch (ext) {
            case 'xlsx':
                break;
            default:
                alert('This is not an allowed file type.');
                this.value = '';
        }
    });
});
// function generateQr(qrtext) {
//     return new Promise((resolve, reject) => {
//         console.log('Second');
//         setTimeout(function() {
//             var img1 = document.getElementById('qrcode').getElementsByTagName('img')[0];
//             var img2 = document.getElementById('img2');
//             var canvas = document.getElementById('canvas');
//             var context = canvas.getContext('2d');
//             canvas.width = img1.width;
//             canvas.height = img1.height;
//             context.globalAlpha = 1.0;
//             context.drawImage(img1, 0, 0);
//             // context.globalAlpha = 0.3; //Remove if pngs have alpha
//             context.drawImage(img2, 0, 0);
//             var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//             var data = imageData.data;
//             var removeBlack = function() {
//                 for (var i = 0; i < data.length; i += 4) {
//                     if (data[i] + data[i + 1] + data[i + 2] == 0) {
//                         data[i + 3] = 0; // alpha
//                     }
//                 }
//                 context.putImageData(imageData, 0, 0);
//             };
//             removeBlack();
//             $(".canvaswrapper").show()
//             html2canvas($(".canvaswrapper"), {
//                 onrendered: function(canvas) {
//                     theCanvas = canvas;
//                     document.body.appendChild(canvas);
//                     canvas.toBlob(function(blob) {
//                         //saveAs(blob, "Dashboard.png");
//                         var reader = new FileReader();
//                         reader.readAsDataURL(blob);
//                         reader.onloadend = function() {
//                             base64data = reader.result;
//                             console.log(base64data);
//                         }
//                         console.log("qrtext = ", qrtext)
//                         $("body").children('canvas').remove()
//                         resolve()
//                     });
//                 }
//             });
//         }, 200)
//     })
// }
function showQr(qrtext) {
    // qrtext = $("#qrTxt").val()
    return new Promise((resolve, reject) => {
        async function qrPromise() {
            console.log('Initial');
            qrtext = qrtext.toString()
            console.log("qrtext = ", qrtext)
            if (qrtext == '') {
                return
            }
            $(".canvaswrapper").hide()
            $("body").children('canvas').remove()
            $("#qrcode").html('')
            var a = new QRCode(document.getElementById("qrcode"), {
                text: qrtext, // Content
                render: 'image',
                width: 750, // Widht
                height: 750, // Height
                colorDark: "#000000", // Dark color
                colorLight: "#ffffff", // Light color
                logo: "grfx/aplogo.png", // LOGO
                // logoWidth: 222,
                // logoHeight: 222,
                logoBgColor: '#ffffff', // Logo backgroud color, Invalid when `logBgTransparent` is true; default is '#ffffff'
                logoBgTransparent: false, // Whether use transparent image, default is false
                minVersion: 1,
                maxVersion: 1,
                correctLevel: QRCode.CorrectLevel.H, // L, M, Q, H
            });
            var key = Object.keys(a)[0];
            var value = a[key]
            var textLength = value["text"].length
            var logoH = value["logoHeight"]
            var logoW = value["logoWidth"]
                // console.log("logoH =", logoH);
                // console.log("logoW =", logoW);
            console.log("textLength =", textLength);
            if (textLength < "5") {
                $("#img2").attr('src', 'grfx/qr-code-one-eyes.png')
            }
            if (textLength >= "5" && textLength < "12") {
                $("#img2").attr('src', 'grfx/qr-code-five-eyes.png')
            }
            if (textLength >= "12" && textLength < "22") {
                $("#img2").attr('src', 'grfx/qr-code-twelve-eyes.png')
            }
            if (textLength >= "22" && textLength < "32") {
                $("#img2").attr('src', 'grfx/qr-code-twentytwo-eyes.png')
            }
            if (textLength >= "32" && textLength < "42") {
                $("#img2").attr('src', 'grfx/qr-code-thirtytwo-eyes.png')
            }
            await generateQr(qrtext)
            resolve();
        }
        qrPromise()
    })
}

function readExcelFile() {
    var formData = new FormData();
    var fileData;
    fileData = $('input[type="file"]')[0].files;
    foldername = $('#foldername').val()
    if (fileData.length == 0) {
        ipc.send("excelAlert")
            // alert("choose excel file!")
        return
    }
    if (foldername == "") {
        ipc.send("folderAlert")
            // alert("Enter folder name!")
        return false;
    }
    console.log("foldername = ", foldername);
    console.log("fileData = ", fileData);
    formData.append("excel[]", fileData[0]);
    $('.doneMsg').hide()
    $('.overlay').show()
    $.ajax({
        type: 'POST',
        url: "process/readexcelfile.php",
        contentType: false,
        processData: false,
        data: formData,
        success: function(data) {
            // console.log("response:", data);
            if (data.includes('ERROR')) {
                console.log("error msg :", data)
                alert(data)
            } else {
                console.log("success data:", data)
                excelData = JSON.parse(data)
                excelData = excelData.detail;
                //var totalExcelData = excelData.detail.length;
                (async() => {
                    // for (let i = 0; i < totalExcelData; i++) {
                    //     var qrtext = excelData.detail[i]
                    //     console.log("qrtext = " + qrtext);
                    //     await showQr(qrtext);
                    // }
                    for (let e of excelData) {
                        console.log(e);
                        await showQr(e);
                    }
                    $('.overlay').hide()
                    $('.doneMsg').show()
                    foldername = ""
                        // $('#foldername').val('')
                    $('form :input').val('');
                    console.log('end');
                })();
            }
        },
        error: (function(jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'INTERNET_DISCONNECTED Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log("error:" + msg);
        })
    });
}