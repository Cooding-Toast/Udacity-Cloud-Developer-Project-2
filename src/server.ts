import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

    // middleware checking url and returing message to try filteredimage url
  app.use(function (req, res, next) {
      if (req.path != '/filteredimage') {
        res.send("try GET /filteredimage?image_url={{}}")
      }
      next()
  });


  //! END @TODO1n calidate image url
  app.get( "/image", async (req: Request, res: Response) => {
   
    const {imageUrl} = req.query;

     //Url not null
    if(!imageUrl){              
      res.status(422).json({     
        status: false,
        message: 'Image Required'
      }); 
      // image extention 
    }else if(!imageUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(jpeg|jpg|gif|png)$/)){           //return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);    https://stackoverflow.com/questions/9714525/javascript-image-url-verify
      res.status(422).json({
        status: false,
        message: 'invalid image URL, Please provide a proper image URL'
      });
      // process image
    }else{
    const imagePath = await filterImageFromURL(imageUrl);   //call image filter 
    res.status(200).sendFile(imagePath, err => {
      if (err){
        console.log('Error Processing Image');
        console.log(err);
        //removing files from the server
      }else{
        res.on('close', () =>  {
        deleteLocalFiles([imagePath]);
        })
      }
    })
    
  } });
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();