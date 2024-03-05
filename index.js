const fs = require("fs");
const http = require("http");
const url = require("url");

const replaceTemplate = (temp, product) => {
  if (!product) {
    // Обработка случая, когда данные о продукте не доступны
    return "Данные о продукте недоступны";
  }

  let output = temp.replace(
    /{%PRODUCTNAME%}/g,
    product.productName || "Название продукта не доступно"
  );
  output = output.replace(
    /{%IMAGE%}/g,
    product.image || "путь/к/изображению-по-умолчанию.jpg"
  );
  output = output.replace(
    /{%FROM%}/g,
    product.from || "Неизвестное происхождение"
  );
  output = output.replace(/{%PRICE%}/g, product.price || "Цена не доступна");
  output = output.replace(
    /{%NUTRIENTS%}/g,
    product.nutrients || "Пищевые вещества не доступны"
  );
  output = output.replace(
    /{%QUANTITY%}/g,
    product.quantity || "Количество не доступно"
  );
  output = output.replace(
    /{%DESCRIPTION%}/g,
    product.description || "Описание не доступно"
  );
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace(/{'%NOT_ORGANIC%'}/g, "not-organic");
  }

  return output;
};

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

// const server = http.createServer((req, res)=>{
//   //const pathName = req.url;
//  // console.log(url.parse(req.url, true));
//   const {query, pathname} = url.parse(req.url, true);
//   //overview
//   if (pathname === '/' || pathname === '/overview'){
//     res.writeHead(200, {'content-type':'text/html'});
//     const cardsHTML = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
//     const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHTML);
//     res.end(output);
//     //product page
//   } else if (pathname === '/product'){
//     res.writeHead(200, {'content-type': 'text/html'});  //Передаем информацию браузеру
//     const product = dataObj[query.id] // dataObj [0]
//     const output = replaceTemplate(tempProduct, product)
//     res.end(output);
//     console.log("Query ID:", query.id);
//     //api
//   } else if (pathname === '/api'){
//     res.writeHead(200,{
//       'content-type': 'application/json',
//     })
//       res.end(data);
// //not found
//   } else {
//     res.writeHead(404,{
//       'content-type': 'text/html',
//       'my-own-header': "Hello world!"
//     })
//     res.end('<h1>Page not found!</h1>')
//   }
// })

// server.listen(8000, '127.0.0.1', ()=>{
//   console.log('Listening on porn 8000');
// })

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Обработка запроса к странице продукта
  if (pathname === "/product") {
    const productId = parseInt(query.id);

    if (!isNaN(productId)) {
      const product = dataObj.find((item) => item.id === productId);

      if (product) {
        // Обработка успешного поиска
        res.writeHead(200, { "content-type": "text/html" });
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
      } else {
        // Продукт не найден, возвращаем ошибку
        res.writeHead(404, {
          "content-type": "text/html",
          "my-own-header": "Hello world!",
        });
        res.end("<h1>Product not found!</h1>");
      }
    } else {
      // Некорректный или отсутствующий id в запросе
      res.writeHead(400, {
        "content-type": "text/html",
        "my-own-header": "Hello world!",
      });
      res.end("<h1>Bad Request: Invalid or missing product ID</h1>");
    }
  } else if (pathname === "/" || pathname === "/overview") {
    // Обработка запроса к обзорной странице
    res.writeHead(200, { "content-type": "text/html" });
    const cardsHTML = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);
    res.end(output);
  } else if (pathname === "/api") {
    // Обработка запроса к API
    res.writeHead(200, {
      "content-type": "application/json",
    });
    res.end(data);
  } else {
    // Страница не найдена
    res.writeHead(404, {
      "content-type": "text/html",
      "my-own-header": "Hello world!",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening on port 8000");
});
