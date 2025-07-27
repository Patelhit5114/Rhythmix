import { openUploadWidget } from "../../utils/CloudinaryService";
// import { cloudinary_upload_preset } from "../../config";

const CloudinaryUpload = ({setUrl,setName}) => {
  const uploadImageWidget = () => {
    let myUploadWidget = openUploadWidget(
      {
        cloudName:"dkqip0lg3",
        uploadPreset: "rhythmix",
        sources: ["local"]
      },
      function (error, result) {
        if (!error && result.event === "success") {
        //   props.onImageUpload(result.info.public_id);
        setUrl(result.info.secure_url);
        setName(result.info.original_filename);
        }else{
            if(error){
                console.log(error);
            }
        }
      }
    );
    myUploadWidget.open();
  };

  return (
    <button className="bg-white text-black rounded-full font-semibold p-4" onClick={uploadImageWidget}>
      Select Track
    </button>
  );
};

export default CloudinaryUpload;
