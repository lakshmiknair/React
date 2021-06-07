import React, { Component } from 'react';
import axios from 'axios';
import { Link, Redirect } from 'react-router-dom';
import '../../assets/css/course.css';
import { v4 as uuidv4 } from 'uuid';

class ListBreakdowns extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      course_id: (this.props.match && this.props.match.params && this.props.match.params.id) ? this.props.match.params.id : '',
      coursename:'',
      breakdown: {
        breakdown_id: '',
        units: [{
          unit_id: '',
          unitname: '',
          articles: [{
            article_uuid: '',
            articlename: ''
          }]
        }]
      },
      showUnitForm: true,
      customArticleName: '',
      errorArticle: '',
      loc_course:'0'


    }

    this.handleSubmit = this.handleSubmit.bind(this);


  }
  componentDidMount() {

    if (!sessionStorage.getItem("user")) {
      alert("Please Sign in to wrtie articles");
      // return <Redirect to="/login"/>
      window.location.href = "/login";
    }

    var self = this;
    const postData = {
      action: 'list-breakdowns',
      //   user_id: JSON.parse(sessionStorage.getItem("user")).id,
      //    coursename: this.state.coursename,
      //    course_type_id: this.state.course_type_id,
      course_id: this.state.course_id
    }
    let formData = new FormData();
    let post = JSON.stringify(postData);
    formData.append("postData", post);
    var self = this;
    axios({
      method: 'POST',
      url: window.api_url + 'courseDetails.php',
      data: formData,
    })
      .then(function (response) {
        //  alert(response.data.breakdown_id)
        if (response.data)
          self.setState({ breakdowns: response.data.breakdown });
           self.setState({ breakdown_id: response.data.breakdown_id });
           self.setState({ coursename: response.data.coursename });
      });
  }

  createUnit() {
    return this.state.breakdown.units.map((unit, i) =>
    
      <div key={i}>
        {i !== 0 ?
          <span className="remove-unit" id={`remove_${i}`} onClick={this.removeUnitClick.bind(this, i)}>&times;</span>
          : ''
        }
        <span className="form-outline unit-field mb-5" >
          <input value={unit.unitname} onChange={this.handleUnitChange.bind(this, i)} type="text" id={`unitname_${i}`} className="form-control" placeholder="Type in name of Unit" />
          <label className="form-label" htmlFor={`unitname_${i}`}>Unit {i + 1}</label>
        </span>
        {i === this.state.breakdown.units.length - 1 ?
          <button onClick={this.addUnitClick.bind(this, i)} className="uploadbtn">Add Another Unit</button>
          : ''
        }

        {unit.articles.map((art, j) =>            
              <>
                  <div className="ms-5">
                    {j !== 0 ?
                      <span className="remove-unit" id={`remove_${i}_${j}`} onClick={this.removeArticleClick.bind(this, i, j)} >&times;</span>
                      : ' '
                    }
                    <span className="form-outline article-field mb-5 ">
                      <input value={art.articlename} onChange={this.handleArticleChange.bind(this, i, j)} id={`articlename_${i}_${j}`} type="text" className="form-control" placeholder="Type in name of Article" />
                      <label className="form-label" htmlFor={`articlename_${i}_${j}`}>Article Name</label>
                    </span>
                    {j === unit.articles.length - 1 ?
                      <button onClick={this.addArticleClick.bind(this, i)} className="uploadbtn">Add Another Article</button>
                      : ''
                    }
                  </div>
                </>               
        )}
      </div>
    )
  }
  addUnitClick(i, event) {
    const currentunits = this.state.breakdown.units;
    currentunits.push({ unit_id: '', unitname: '', articles: [{ article_uuid: '', articlename: '' }] })
    this.setState(prevState => ({
      ...prevState.breakdown,
      units: [{
        ...currentunits,
      }]
    }));
  }
  addArticleClick(i, event) {
    const units = this.state.breakdown.units[i];
    const currentart = units.articles;
    currentart.push({ article_uuid: '', articlename: '' })
    //  const prevState = prevState.breakdown;
    this.setState(prevState => ({
      ...prevState.units,
      articles: [{
        ...currentart
      }]
    }));
  }
  removeUnitClick(i) {

    const breakdown = this.state.breakdown;
    const currentunits = breakdown.units;
    currentunits.splice(i, 1);
    this.setState(state => ({
      units: currentunits
    }));
    console.log(this.state.breakdown.units)
  }
  removeArticleClick(i, j) {
    const currentunits = [...this.state.breakdown.units];
    const currentarts = currentunits[i].articles;
    currentarts.splice(j, 1);
    this.setState(state => ({
      articles: currentarts
    }));

  }
  handleUnitChange(i, event) {
    let units = [...this.state.breakdown.units];
    units[i].unitname = event.target.value;
    units[i].unit_id = uuidv4();
    this.setState({ units });
    //  console.log(this.state.breakdown)
  }
  handleArticleChange(i, j, event) {
    const units = [...this.state.breakdown.units];
    const articles = units[i].articles;
    articles[j].articlename = event.target.value;
    articles[j].article_uuid = uuidv4();
    this.setState({ articles });
    //   console.log(this.state.breakdown)
  }
  handleSubmit(event) {
    var flag = 0;
    const mapval = this.state.breakdown.units.map((item) => {
      item.unitname === '' ? flag = 1 : flag = 0
    });
    
    if (flag === 0) {
      
        const postData = {
        action: 'breakdown-request',
        user_id: JSON.parse(sessionStorage.getItem("user")).id,
        course_id: this.state.course_id,
        //  coursename: this.state.coursename,
        //  course_type_id: this.state.course_type_id,
        breakdown: JSON.stringify(this.state.breakdown)
      }
      let formData = new FormData();
      let post = JSON.stringify(postData);
      formData.append("postData", post);
      // formData.append('codeToUpload', file);
      var self = this;
      axios({
        method: 'POST',
        url: window.api_url + 'courseDetails.php',
        data: formData,
      })
        .then(function (response) {
          if (response.data){
            alert("Request Processed, You Will Notified Once We Have Looked Over Your Request");
            self.setState({ loc_course: '1' })
          }
        });
    }
    else {
      alert('Enter a Unit')
    }

  }
  changeButton = (e) => {
    if (e.target.id == 'submitBreak')
      this.setState({ showUnitForm: true })
    else
      this.setState({ showUnitForm: false })
  }
  handleCustomArticleChange = (e) => {
    this.setState({ customArticleName: e.target.value })
  }
  handleArticleSubmit = (e) => {
    if (this.state.customArticleName === '')
      this.setState({ errorArticle: "Article Name is required" });
    else {
      const postData = {
        action: 'write-article',
        user_id: JSON.parse(sessionStorage.getItem("user")).id,
        coursename: this.state.coursename,
        course_type_id: this.state.course_type_id,
      }
      let formData = new FormData();
      let post = JSON.stringify(postData);
      formData.append("postData", post);
      var self = this;
      axios({
        method: 'POST',
        url: window.api_url + 'courseDetails.php',
        data: formData,
      })
        .then(function (response) {
          self.setState({ showUnitForm: false });
        });
    }
  }
  skipBreakdown = (e) => {
    window.location.href = "/write-articles";
  }

  render() {

    if (this.state.loc_course === '1') {
      return <Redirect to="/write-articles"/>
    }

    return (

      (this.state.breakdowns) ?

        <div className="container bootdey mt-5 pb-5 " >
          <h1 className="fw-bold">{this.state.coursename}</h1>
          <hr></hr>
          {this.state.breakdowns.units && this.state.breakdowns.units.map((item) =>
            <>
              <h4 className="fw-bold mb-4 mt-4">{item.unitname}</h4>
              <div className='unitBreakdownlist'>
                {item.articles.map((art) =>
                  <div className="article text-topnav"><p className="articleToEdit">{art.articlename}
                    <Link to={`/articlegen/${this.state.breakdowns.breakdown_id}/${art.article_uuid}`} style={{ 'color': '#4b566b' }}>
                      <i className="fa fa-edit ms-2" aria-hidden="true"></i></Link>
                  </p></div>
                )}
               </div>
            </>
          )}
         
          {/*<span className="float-end">
            <button className="uploadbtn" id="submitBreak" onClick={this.changeButton}>Submit Course Breakdown</button>
              </span>*/}
          <div className="unitArticle" style={{ 'position': 'relative', 'left': '30%' }}>
            <hr/>
            <span className="form-outline ms-4" style={{ 'borderBottom': '1px solid #999' }} >
              <input onChange={this.handleCustomArticleChange} type="text" id="article" className="form-control" placeholder="Type in name of Article" />
              <label style={{'color':'#8492a6'}} className="form-label" htmlFor="article">Article Name</label>
            </span>
            <div style={{ 'display': 'block' }} className='invalid-feedback'>{this.state.errorArticle}</div>
            <button className="uploadbtn" type="submit" onClick={this.handleArticleSubmit}>Submit Article Suggestion</button>
          </div>
        </div>
        :
        <div className="container bootdey mt-5 pb-5 " >

          {this.state.showUnitForm ?
            <>
              <span className="float-start">
                <h1 id="noBreakdownHeader">Submit Course Breakdown</h1>
                <p id="noBreakdownDesc">
                  This course does not currently have a breakdown. You can submit one below. <br />
                  <b>(Introduction and Summary articles are automatically added to each article)</b>
                </p>
              </span>
              <span className="float-end">
                <button className="uploadbtn" id="customArt" onClick={this.changeButton}>Write Custom Article</button>
              </span>
              <div className="unit-form mb-5">
                {this.createUnit()}
                <button className="btn btn-primary fw-bold me-3" style={{ 'position': 'relative', 'left': '35%' }} onClick={this.skipBreakdown}>Skip Breakdown</button>
                <button className="btn btn-primary fw-bold" style={{ 'position': 'relative', 'left': '35%' }} type="submit" onClick={this.handleSubmit}>Submit</button>
              </div>
              <br/><br/>
              </>

            :
            <>
              <span className="float-start">
                <h1 id="noBreakdownHeader">Create a Custom Article</h1>
                <p id="noBreakdownDesc">
                  This course does not currently have a breakdown. Fill out the form below to create a custom article. <br />
                  <b>(Custom articles that do not fit in with other articles will be removed or not accepted)</b>
                </p>
              </span>
              <span className="float-end">
                <button className="uploadbtn" id="submitBreak" onClick={this.changeButton}>Submit Course Breakdown</button>
              </span>
              <div className="unit-form mb-5">
                <span className="form-outline unit-field mb-5" >
                  <input onChange={this.handleCustomArticleChange} type="text" id="article" className="form-control" placeholder="Type in name of Article" />
                  <label className="form-label" htmlFor="article">Article Name</label>
                </span>
                <div style={{ 'display': 'block' }} className='invalid-feedback'>{this.state.errorArticle}</div>
                <button className="uploadbtn text-center" type="submit" onClick={this.handleArticleSubmit}>Submit Article Suggestion</button>
              </div>
              <br /><br/>
            </>
          }
        </div>
    )
  }
}
export default ListBreakdowns;