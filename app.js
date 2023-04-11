//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');

require('dotenv').config();

// console.log(process.env);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://yupadhyayyk:${process.env.PASSWORD}@cluster0.uzfrrrm.mongodb.net/todolistDB`);
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error:', err);
});
//

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("list", listSchema);
const Item = mongoose.model("Item", itemsSchema);

// CREATING A FEW DEFAULT ITEMS.
const item1 = new Item({
  name: "Default task 1 "
});

const item2 = new Item({
  name: "Default task 2",

});

const item3 = new Item({
  name: "Default task 3",

});
const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems);


// Item.insertMany([item1, item2, item3]);


app.get("/", function (req, res) {

  Item.find()
    .then((Founditems) => {
      if (Founditems.length === 0)  //also const count = await Item.countDocuments({});
      {
        async function insertDefaultItems() {
          try {
            await Item.insertMany(defaultItems);
            console.log(' inserted successfully standard items');
          } catch (error) {
            console.log('Error inserting default items:', error);
          }
        }

        insertDefaultItems();
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: Founditems });
      }
    })
    .catch((err) => {
      console.log(err);
    });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const newItemDoc = new Item({
    name: itemName
  });
  if (listTitle === "today") {

    newItemDoc.save();
    // if (req.body.list === "Work") {
    //   workItems.push(item);
    //   res.redirect("/work");
    // } else {
    //   items.push(item);
    res.redirect("/");
  }
  else {
    const query = {
      name: listTitle
    }
    List.findOne(query)
      .then(doc => {
        doc.items.push(newItemDoc);
        doc.save();
      }).catch(err => {
        console.log(err);
      });
    res.redirect("/" + listTitle);
  }
  // }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  const query = { name: customListName };

  List.findOne(query)
    .then(doc => {
      if (doc == null) {
        //  %%% IF THE LIST DOES'NT EXIST THEN HERE WE CREATE A NEW ONE 
        const newList = new List({
          name: customListName,
          items: defaultItems
        });
        newList.save();
        //  REDIRECT THE SERVER TO THE CUSTOM ROUTE SO AS TO NOT LEAVE IT HANGING
        res.redirect("/" + customListName);
      }
      else {
        //  IN THIS CASE WE DISPLAY THE EXISTING LIST 
        res.render("list", { listTitle: doc.name, newListItems: doc.items });
        // console.log("route " + doc.name + " ALREADY EXISTS");

      }
    })
    .catch(err => {
      console.log('ERROR FINding document ', err);
    })
})

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkBox;
  const ListName = req.body.ListName;
  if (ListName === "today") {

    // console.log(checkedItemId);
    Item.findByIdAndDelete(checkedItemId)
      .then((doc) => {
        console.log(`Document ${doc.name} deleted successfully`);
      })
      .catch((err) => {
        console.log(err);
      });
    setTimeout(function () {
      // Code to be executed after 2 seconds
      res.redirect("/");
      console.log('REdirected after 1 seconds');
    }, 1000); // 2000 milliseconds = 2 seconds
  }
  else {
    List.findOneAndUpdate({
      name: ListName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }).then((FoundList) => {
      console.log("\nDELETED");
    }).catch((err) => {
      console.log("\nERROR :>>>", err);
    })

    setTimeout(function () {
      // Code to be executed after 2 seconds
      res.redirect("/"+ListName);
      console.log('REdirected after 1 seconds');
    }, 1000); // 2000 milliseconds = 2 seconds
  }
});


app.get("/about", function (req, res) {
  res.render("about");
});

//using express routing parameters


app.listen(3000, function () {
  console.log("Server started on port 3000");
});

