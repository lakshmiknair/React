import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import MathJax from 'react-mathjax3';
import Modal from "../common/Modal";
import { deleteContent, updateContent } from '../../redux/actions';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { setNewOrder } from '../../redux/actions';
import MathFormat from "./MathFormat";
import { formatDetails } from "../../assets/js/data";

const ascii = 'sum_(i=1)^n i^3=((n(n+1))/2)^2';
const mathContent = ` $$${ascii}$$`;

class ArticleContent extends Component {
  constructor(props) {
    super(props);
    this.clickMath = this.clickMath.bind(this);
    this.modules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ header: [false, 3, 4] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['math', 'link', 'image', 'code-block'],
          [{ script: "sub" }, { script: "super" }],
          ['clean']
        ],
        handlers: {
          'math': this.clickMath
        }
      },
    };
  
    this.state = {
      modal: false,
      mathModal: false,
      mathContent: mathContent,
      type: this.props.value.type,
      articleFields: [],
      articleContents: [{
        id: '',
        field_id: '',
        content_html: '',
        content_formatted: '',
        hideAnswer: '',
        hideGeneralContent: ''
      }],
      urlparams: {
        type : this.props.value.type,
        coursename : this.props.value.coursename,
        unitname :  this.props.value.unitname,
        articlename : this.props.value.articlename,
        user_id : this.props.value.user_id,
        breakdown_id : this.props.value.breakdown_id,
        course_id : this.props.value.course_id,
        course_type_id : this.props.value.course_type_id        
      }
    };
  }

  //For Mathjax  Functions
  clickMath() {
    this.mathModalOpen();
  }
  addSymbol = (e) => {
    const editor = this.reactQuillRef.getEditor();
    var html = this.demoRender.innerHTML;
    var forText = html.replace('class="MathJax"', '');
    forText = forText.replace('<span class="MathJax_Preview" style="color: inherit; display: none;"></span>', "");
    var range = editor.getSelection(true);
    editor.deleteText(range.index, range.length);
    editor.insertEmbed(range.index, 'mathjax', forText);
    editor.setSelection(range.index + range.length + 1);
  }
  mathModalOpen() {
    this.setState({ mathModal: true });
  }
  mathModalClose() {
    this.setState({
      mathModal: false
    });
  }
  updateMath = e => this.setState({ mathContent: ` $$${e.target.value}$$` })
  //End Mathjax Functions

  handleEditClick = (e) => {
  
    this.modalOpen(e);
  }
  formattedData = (content_html, field_id) => {
    let formattedField = this.state.articleFields.find(data => data.field_id === field_id)
    let str = formattedField.format;
    let formattedCont = str.replace('__Replace__', content_html);
    return formattedCont;
  }
  handleSubmit = (e) => {
    e.preventDefault();
    let content_html;

    if (this.props.value.field_id !== 'console_output') {
      const editor = this.reactQuillRef.getEditor();
      const unprivilegedEditor = this.reactQuillRef.makeUnprivilegedEditor(editor);
      content_html = unprivilegedEditor.getHTML();
    }
    else {
      content_html = this.outputConsole.value;
    }
    if (content_html.length !== 0 && content_html !== '<p><br></p>') {
      const content_formatted = this.formattedData(content_html, e.target.id);
    //  alert(content_formatted)
      const articleContents = {
        content_html: content_html,
        content_formatted: content_formatted,
        hideAnswer: (this.hideAnswer ? this.hideAnswer.checked : false),
        hideGeneralContent: (this.hideGeneralContent ? this.hideGeneralContent.checked : false)
      }     
     this.props.dispatch(updateContent(this.props.value.id, articleContents, this.state.urlparams ));
    }  
    this.modalClose();
  }
  modalOpen() {
  
    this.setState({ modal: true });
  }
  modalClose() {
    this.setState({
      modal: false
    });
  }
  componentDidMount() {
    
      const type = this.state.urlparams.type;
      const articleF = formatDetails.find(data => data.type === type);
      if (articleF) {
        const articleFields = articleF.details;
        this.setState({ articleFields: articleFields })
        this.setState({ type: type })
      }

    if (this.props.value.field_id !== 'console_output') {
      const editor = this.reactQuillRef.getEditor();
      var html = this.props.value.content_html;
      var range = editor.getSelection(true);
      editor.deleteText(range.index, range.length);
      editor.insertEmbed(range.index, 'mathjax', html);
      editor.setSelection(range.index + range.length + 1);
    }
  }

  render() {

    return (
      <React.Fragment>

        <li className="dialog" id="contentShowcase">
          {this.props.value.content_html !== '<hr>Separtor' ? (
            <i onClick={this.handleEditClick} className="material-icons fas fa-edit" id="dialogEdit"></i>
          ) : ''
          }
          <i onClick={() => this.props.dispatch(deleteContent(this.props.value.id, this.state.urlparams))} className="close-classic" />

          <div id="htmlContent" dangerouslySetInnerHTML={{ __html: this.props.value.content_html }} />

          <Modal id="editQuill" show={this.state.modal} handleClose={e => this.modalClose(e)}>
            <form onSubmit={this.handleSubmit} id={this.props.value.field_id}>
              {(this.props.value.field_id === 'check_answer' ? (
                <div className="hideAnswer">
                  <label className="switch">
                    <input id="ccAnswerHidden" type="checkbox" ref={(el) => { this.hideAnswer = el }} defaultChecked={this.props.value.hideAnswer} />
                    <span className="slider round" />
                  </label>
                  <p>Hide Answer Initially?</p>
                </div>
              ) : '')}

              {(this.props.value.field_id === 'general_content' && this.state.type == 'code') ? (
                <div className="hideAnswer">
                  <label className="switch">
                    <input id="ccAnswerHidden" type="checkbox" ref={(el) => { this.hideGeneralContent = el }} defaultChecked={this.props.value.hideGeneralContent} />
                    <span className="slider round" />
                  </label>
                  <p>Hide Content Initially?</p>
                </div>
              ) : ''}
              {(this.props.value.field_id !== 'console_output' ? (

                <ReactQuill theme="snow" modules={this.modules} ref={(el) => { this.reactQuillRef = el }} defaultValue="" >
                </ReactQuill>
              ) :
                (
                  <textarea id="consoleText" ref={(el) => { this.outputConsole = el }} style={{ 'width': '100%', 'height': '274px' }} className="outputConsole" spellCheck="false" defaultValue={this.props.value.content} />
                )
              )}
              <button className="changeContent">Change Content</button>
            </form>
          </Modal>
          <Modal id="mathQuill" type="math" className show={this.state.mathModal} handleClose={e => this.mathModalClose(e)}>
            <span onClick={e => this.mathModalClose(e)} className="close">&times;</span>
            <div className="leftColumn">
              <label htmlFor="demoSource">Input:</label>
              <textarea ref={(el) => { this.demoSource = el }} onChange={this.updateMath} className="demoSource" id="demoSource" defaultValue={ascii} />
              <label htmlFor="demoRendering" >Rendering:</label>
              <div id="demoRendering" className="demoRender" ref={(el) => { this.demoRender = el }}>
                <MathJax.Context
                  input='ascii'
                  onLoad={() => console.log("Loaded MathJax script!")}
                  onError={(MathJax, error) => {
                    console.warn(error);
                    console.log("Encountered a MathJax error, re-attempting a typeset!");
                    MathJax.Hub.Queue(
                      MathJax.Hub.Typeset()
                    );
                  }}
                  script="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML"
                  options={{
                    asciimath2jax: {
                      useMathMLspacing: true,
                      delimiters: [["$$", "$$"]],
                      preview: "none",
                    }
                  }}
                >
                  <MathJax.Text text={this.state.mathContent} />
                </MathJax.Context>
              </div>
              <button className="addSymbol" onClick={this.addSymbol}>Add Symbol</button>
              <button className="repairMath">Repair Math Error</button>
            </div>
            <div className="rightColumn style-2">
              <MathFormat></MathFormat>
            </div>
          </Modal>
        </li>
      </React.Fragment>
    )
  }
}
const Article = connect()(ArticleContent);

const SortableItem = SortableElement(Article);

const SortableList = SortableContainer(({ items }) => {
  return (
    <div className="style-2" id="midSector">
      <div className="currentContent">
        <h4>Current Content</h4>
        <hr />
      </div>
      <ul id="midSectorID" className="style-2">
        {((items && Object.keys(items).length > 0)) ?

          items.map((item, index) =>
          (
            <SortableItem key={item.id} index={index} value={item} />
          )
          )

          : ''}

      </ul>
    </div>
  );
});

class CurrentContent extends Component {
  constructor(props) {
    super(props);
  }
  onSortEnd = ({ oldIndex, newIndex }) => {
    const newList = arrayMove(this.props.items, oldIndex, newIndex);
    const data = {
      newList
    }
    this.props.dispatch(setNewOrder(data, this.props.urlparams));
  }
  render() {
    return <SortableList axis="xy" onSortEnd={this.onSortEnd.bind(this)}
      distance={2} items={this.props.items} />;
  }
}

const mapStateToProps = (state) => { 
  console.log(state);
  return {
    items: state.contents ? state.contents : [],   
  }
}

export default connect(mapStateToProps)(CurrentContent);