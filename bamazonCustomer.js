// Include SQL npm package
var mysql = require("mysql");
var inquirer = require("inquirer");
require('console.table');

// Configures connection
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bamazonDB'
});

// Establish connection with error handler
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
  runScript();
});

function runScript() {
// Display the items in the bamazon store
  connection.query('SELECT * FROM products', function (error, results, fields) {
    if (error) {
      console.log(error)
    }
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
    //console.log(results)
    console.table(results);

      // Prompt user to require product information
    inquirer.prompt([
      {
        type: "input",
        name: "itemId",
        message: "What is the item id of the product you wish to buy?"
      }
    // After the prompt, store the user's response in a variable called "wish"
    ]).then(function(wish) {
      getProductByID(wish.itemId, function(item) {
        inquirer.prompt([
          {
            type: "input",
            name: "quantity",
            message: `How many ${item.product_name}(s) would you like to buy? We have ${item.stock_quantity} in stock!`
          }
        // After the prompt, store the user's response in a variable called "wish"
        ]).then(function(answers) {
          if (answers.quantity > item.stock_quantity) {
            console.log('Insufficient quantity!');
            setTimeout(function() {
              runScript();
            }, 2000);
          } else {
            purchaseProducts(item.item_id, answers.quantity, function(message) {
              console.log(`You bought ${answers.quantity} ${item.product_name}(s)`);
              setTimeout(function() {
                runScript();
              }, 2000);
            });
          }
        });
      })
    });
  });
};

function getProductByID(id, callback) {
  connection.query('SELECT * FROM `products` WHERE item_id = ?', id, function(error, results){
    callback(results[0])
  })
}

function purchaseProducts(itemId, quantity, callback) {
  var query = `UPDATE products SET stock_quantity = stock_quantity - ${quantity} WHERE item_id = ${itemId}`;
  console.log('query', query);
  connection.query(query, function(error, results) {
    callback('Success');
  })
}

function getAllProducts() {

}
