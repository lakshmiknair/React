import axios from 'axios';
import {
  ADD_CONTENT,
  DELETE_CONTENT,
  UPDATE_CONTENT,
  REORDER_LIST,
  GET_CONTENTS,
  SUBMIT_ARTICLE
} from './actions';
const inital_state =  {
 //articleContents :[{}]
};

const reducer = (state = [], action) => {
  switch (action.type) {   
    case ADD_CONTENT: { 
    const postData = state.concat([action.payload.data]); 
    const urlparams = action.payload.urlparams;  
    saveArticle(postData, urlparams);   
    //console.log(postData);
    return postData;
    }
    case DELETE_CONTENT: {
      const postData = state.filter((item) => item.id !== action.payload.id);
      const urlparams = action.payload.urlparams;  
      saveArticle(postData, urlparams);
      return postData;
    }
    case UPDATE_CONTENT:{
      var postData = state.map((item) => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            content_html: action.payload.data.content_html,
            content_formatted: action.payload.data.content_formatted,
            hideAnswer: action.payload.data.hideAnswer,
            hideGeneralContent: action.payload.data.hideGeneralContent
          }
        }
        else {
          return item;
        }
      });
      const urlparams = action.payload.urlparams;  
      saveArticle(postData, urlparams);
      return postData;
    }   
    case REORDER_LIST: {
      const postData = action.payload.data.newList;
      const urlparams = action.payload.urlparams;  
      saveArticle(postData, urlparams);
      return postData;
    }
    case GET_CONTENTS: {
      return action.payload.data;
    }
    case SUBMIT_ARTICLE: {  
      const urlparams = action.payload.urlparams;    
      submitArticle(state, urlparams);
      return state;
    }
    case 'CHANGE_COURSE_IMAGE':{
      changeCourseImage(action.payload.data,action.payload.image);
     // alert(action.payload.courseImage)
      return {
          ...state,
          courseImage: action.payload.courseImage
      }       
    }
 
    default:
      return state;
  }
};
const saveArticle = (postData, urlparams) => {
  let formData = new FormData();
  urlparams.action = 'save-article' ;
 
 // alert(postData.action)
  let post= JSON.stringify(postData);
  let details = JSON.stringify(urlparams);

  formData.append("postData", post);
  formData.append("details", details);

  axios({
    method: 'POST',
    url: window.api_url + 'articleDetails.php',
    data: formData,
  })
    .then(function (response) {   
      document.getElementById("saved").style.visibility = "visible";
      document.getElementById("saved").style.width ="300px"; 
      document.getElementById("saved").style.opacity ="1"; 
      setTimeout(
        function(){  
          document.getElementById("saved").style.visibility ="hidden";
          document.getElementById("saved").style.width ="0px";
          document.getElementById("saved").style.opacity ="0";
        }
        , 3000); 
       // dispatch(success(data));
    })
    .catch((err) => {
      //  console.log(err)
      // dispatch(error(err))
    })
}

const submitArticle = (post,urlparams) => {
  
  let formData = new FormData();
  urlparams.action = 'submit-article' ;
 

  let postData = JSON.stringify(post); 
  let details = JSON.stringify(urlparams);
  formData.append("postData", postData);
  formData.append("details", details);

  axios({
    method: 'POST',
    url: window.api_url + 'articleDetails.php',
    data: formData,
  })
    .then(function (response) {
     alert(response.data)
      
    })
    .catch((err) => {
      //  console.log(err)
      // dispatch(error(err))
    })
}

const changeCourseImage =(postData, image) =>{

  let formData = new FormData();
  let post = JSON.stringify(postData);
  formData.append("courseImg", image);
  formData.append("postData", post);
  
  axios({
      method: 'POST',
      url: window.api_url + 'profileDetails.php',
      data: formData,
      headers: {
          'content-type': 'multipart/form-data'
      }
  })
  .then(function (response) {
      //alert(response.data.url)
      if (response.data) {
          const url = response.data.url;
       //   self.setState({ courseImg : self.state.temp })
        //  sessionStorage.setItem(`courseTempImg_${self.state.course_id}`, self.state.temp)
        //  self.setState({ courseImg: url })
      }
  });

}

export default reducer;