function getBaseURL(){
  return 'https://webviewer-demo.foxitsoftware.com';
}

function requestData(type:string, url:string, responseType:string, body:any){
  return new Promise(function(res, rej){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(type, getBaseURL() + url);

    xmlHttp.responseType = (responseType || 'arraybuffer') as XMLHttpRequestResponseType;
    var formData = new FormData();
    if (body) {
      for (var key in body) {
        if (body[key] instanceof Blob) {
          formData.append(key, body[key], key);
        } else {
          formData.append(key, body[key]);
        }
      }
    }
    xmlHttp.onloadend = function(e) {
      var status = xmlHttp.status;
      if ((status >= 200 && status < 300) || status === 304) {
        res(xmlHttp.response);
      }else{
        rej(new Error('Sign server is not available.'));
      }
    };

    xmlHttp.send(body ? formData : null);
  });
};

export function initSignatureHandlers(pdfui:any) {
  pdfui.setVerifyHandler(function (signatureField:any, plainBuffer:any, signedData:any){
    return requestData('post', '/signature/verify', 'text', {
      filter: signatureField.getFilter(),
      subfilter: signatureField.getSubfilter(),
      signer: signatureField.getSigner(),
      plainContent: new Blob([plainBuffer]),
      signedData: new Blob([signedData])
    });
  });
  pdfui.registerSignHandler({
    filter: 'Adobe.PPKLite',
    subfilter: 'adbe.pkcs7.sha1',
    flag: 0x100,
    distinguishName: 'e=support@foxitsoftware.cn',
    location: 'FZ',
    reason: 'Test',
    signer: 'web sdk',
    showTime: true,
    sign: function(setting:any, buffer:any) {
      return requestData('post', '/signature/digest_and_sign', 'arraybuffer', {
        plain: new Blob([buffer])
      })
    }
  });
}
