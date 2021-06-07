import axios from 'axios';
export const ADD_CONTENT = 'ADD_CONTENT';
export const DELETE_CONTENT = 'DELETE_CONTENT';
export const EDIT_CONTENT = 'EDIT_CONTENT';
export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export const REORDER_LIST = 'REORDER_LIST';
export const GET_CONTENTS = 'GET_CONTENTS';
export const SUBMIT_ARTICLE = 'SUBMIT_ARTICLE';

export const addContent = (data, urlparams) => {
  console.log(data)
  return {
    type: ADD_CONTENT,
    payload: {
      data: data,
      urlparams:urlparams
    }
  }
};
export const deleteContent = (id, urlparams) => {
  return {
    type: DELETE_CONTENT,
    payload: {
      id: id,
      urlparams:urlparams
    }
  };
};

export const updateContent = (id, data, urlparams) => {
  return {
    type: UPDATE_CONTENT,
    payload: {
      id: id,
      data: data,
      urlparams:urlparams
    },
  };
};
export const setNewOrder = (data, urlparams) => {
  return {
    type: REORDER_LIST,
    payload: {
      data: data,
      urlparams:urlparams
    }
  };
}
export const submitArticle = (data, urlparams) => {
  return {
    type: SUBMIT_ARTICLE, 
    payload: {
      data: data,
      urlparams:urlparams
    }   
  }
};
const getContentData = (data) => {
  return {
    type: GET_CONTENTS,
    payload: {
      data: data
    }
  };
}
export const getContents = (urlparams) => {
  return function (dispatch) {
    axios({
      method: 'GET',
      url: window.api_url + 'articleDetails.php',
      params:{ 
        article_uuid : urlparams.article_uuid,
        breakdown_id : urlparams.breakdown_id,
        action: 'list'
      }
    })
      .then(function (response) {      
        dispatch(getContentData(response.data));     
      })
      .catch((err) => {
        //  console.log(err)
        // dispatch(error(err))
      })
  }
};
