const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//index 
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

//new
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

//show
module.exports.showListing = async (req, res) => {

    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

//create
module.exports.createListing = async(req,res,next)=>{
    let response = await geocodingClient
    .forwardGeocode({
        query:req.body.listing.location,
        limit: 1,
      })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;
   
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing)
    req.flash("success" , "Yeah!! New Listing created..");
    res.redirect("/listings");
};

//edit
module.exports.renderEditForm =async(req,res)=>{
    let {id}=req.params;
   const listing=await Listing.findById(id);
   if(!listing){
    req.flash("error" , "Umm..Listing you requested for does not exist!!");
    res.redirect("/listings");
   }
   res.render("listings/edit.ejs",{listing});
};

//update
module.exports.updateListing =async(req,res)=>{
    let {id}=req.params;
     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

     if(typeof req.file !=="undefined"){
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image={url,filename};
     await listing.save(); 
     }
     req.flash("success" , "Yeah!! Now listings is updated..");
    res.redirect(`/listings/${id}`);
};


//delete
module.exports.destroyListing =async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , "Oops!! Listing is now deleted..");
   res.redirect("/listings");
};


//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);

//     newListing.owner = req.user._id;
//     newListing.image = { url, filename };
//     newListing.geometry = response.body.features[0].geometry;
    
//     let savedListings = await newListing.save();
//     console.log(savedListings);

//     req.flash("success", "new Listing Created!");
//     res.redirect("/listings");
// };

// module.exports.editListing = async (req, res) => {

//     let { id } = req.params;
//     const listing = await Listing.findById(id);

//     if (!listing) {
//         req.flash("error", "Listing you requested for does not exist!");
//         res.redirect("/listings");
//     }

//     let originalImgUrl = listing.image.url;
//     originalImgUrl = originalImgUrl.replace("/upload", "/upload/h_300,w_250");

//     res.render("listings/edit.ejs", { listing, originalImgUrl });
// };

// module.exports.updateListing = async (req, res) => {

//     let { id } = req.params;
//     let listings = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//     if (typeof req.file !== "undefined") {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listings.image = { url, filename };
//         await listings.save();
//     }

//     req.flash("success", "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };

// module.exports.destroyListing = async (req, res) => {

//     let { id } = req.params;
//     let deletedListings = await Listing.findByIdAndDelete(id);
//     console.log(deletedListings);

//     req.flash("success", "Listing Deleted!");
//     res.redirect("/listings");
// };