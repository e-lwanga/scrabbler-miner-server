class CustomError extends Error {
    constructor(code) {
      super(code);
    }
    getCode() {
      return this.message;
    }
  }
  
  module.exports = CustomError;
  
  CustomError.$ = async (requestObj, responder, callback) => {
    let result = null;
    try {
      result = await callback();
    } catch (e) {
      if (e instanceof CustomError) {
        console.log(
          "\x1b[33m%s\x1b[34m%s\x1b[0m",
          `\n!!!!!!!! 400 `,
          `${requestObj.method}---${requestObj.originalUrl}`,
          "\n",
          e
        );
        responder.status(400).end(e.getCode());
        return;
      }
  
      console.error(
        "\x1b[31m%s\x1b[34m%s\x1b[0m",
        `\nXXXXXXXX 500 `,
        `${requestObj.method}---${requestObj.originalUrl}`,
        "\n",
        e
      );
      responder.status(500).end();
      return;
    }
    console.log(
      "\x1b[32m%s\x1b[34m%s\x1b[0m",
      `\n>>>>>>> 200 `,
      `${requestObj.method}---${requestObj.originalUrl}`,
      "\n",
      new Error().stack.split("\n")[1]
    );
    responder.status(200).end(result);
  };
  