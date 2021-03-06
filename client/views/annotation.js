import React from 'react';

import {COLORS} from '../utils.js';
import {KeypointInfo} from './keypoint.js';

/**
 * This renders the annotation details, such as the category name and keypoint visibilities.
 */
export class Annotation extends React.Component {

  constructor(props) {
      super(props);

      this.state = {
        target_id: this.props.target_id || 0,
        target_id_editing: false,
        action: this.props.action || "none" ,
        action_editing: false
      };

      this.keypointVisibilityChanged = this.keypointVisibilityChanged.bind(this);
      this.deleteRequested = this.deleteRequested.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.onFocus = this.onFocus.bind(this);
      this.onAnnotateNA = this.onAnnotateNA.bind(this);
      this.onHideOthers = this.onHideOthers.bind(this);
      this.onActionChange = this.onActionChange.bind(this);
      this.onActionClick = this.onActionClick.bind(this);
      // this.onActionEdit = this.onActionEdit.bind(this);
      // this.onActionConfirm = this.onActionConfirm.bind(this);
  }

  keypointVisibilityChanged(keypoint_index, visibility){

    this.props.handleKeypointVisibilityChange(this.props.id, keypoint_index, visibility);

  }

  deleteRequested(){
    this.props.handleDelete(this.props.id);
  }

  onMouseEnter(){

  }

  onMouseLeave(){

  }

  onFocus(){
    this.props.handleFocus(this.props.id);
  }

  onAnnotateNA(){
    this.props.handleAnnotateKeypoints(this.props.id);
  }

  onHideOthers(){
    this.props.handleHideOthers(this.props.id);
  }

  onTargetIdChange(e){

    if (e.keyCode === 13) {
      if(!parseInt(e.target.value)){//not valid number
        alert("error: target id is not a valid number!");
        return;
      }
      this.setState({
        target_id: parseInt(e.target.value),
        target_id_editing: false
      });
      return;
    }
    
    this.setState({
      target_id: e.target.value
    },
    ()=>{
      if(parseInt(this.state.target_id)){
        this.props.handleAnnotateFieldUpdate(this.props.id, "target_id", parseInt(this.state.target_id));
      }
    })
  }

  onActionChange(e){

    if (e.keyCode === 13) {
      this.setState({
        action_editing: false
      });
      return;
    }
    
    this.setState({
      action: e.target.value
    },
    ()=>{
      // this.props.handleAnnotateAction(this.props.id, this.state.action);
      this.props.handleAnnotateFieldUpdate(this.props.id, "action", this.state.action);
    })
  }

  onActionClick(e){
    console.log(e.target)
    if(e.target.innerHTML){
      if(e.target.innerHTML == "Other"){
        this.setState({
          action: "",
          action_editing: true
        },
        ()=>{
          // this.props.handleAnnotateAction(this.props.id, this.state.action);
          this.props.handleAnnotateFieldUpdate(this.props.id, "action", this.state.action);
        })
      }else{
        this.setState({
          action: e.target.innerHTML,
          action_editing: false
        },
        ()=>{
          this.props.handleAnnotateFieldUpdate(this.props.id, "action", this.state.action);
        })
      }
    }
  }

  render(){
    var align_center_style = {display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"};
    var num_na_keypoints = 0;
    var keypointItems = [];
    for (var j=0; j < this.props.keypoints.length / 3; j++){

      let keypoint_name = this.props.category.keypoints[j];
      let keypoint_color = this.props.category.keypoints_style[j];


      let index = j * 3;
      let v = this.props.keypoints[index + 2];

      if (v == 0){
        num_na_keypoints += 1;
      }

      keypointItems.push((
        <KeypointInfo key={j.toString()} id={j} annotation_id={this.props.id} name={keypoint_name} visibility={v} visibilityChanged={this.keypointVisibilityChanged} color={keypoint_color}/>
      ));

    }

    let annotation_color = COLORS[this.props.id % COLORS.length];

    var na_keypoints_badge;
    if(num_na_keypoints > 0){
      na_keypoints_badge = (<span className="badge badge-warning">{num_na_keypoints} N/A</span>)
    }
    else{
      na_keypoints_badge = (<span className="badge badge-success">{num_na_keypoints} N/A</span>)
    }

    // Are we hidden?
    var hiddenBadge = "";
    if(this.props.hidden){
      hiddenBadge = <span className="badge badge-secondary mr-1">Hidden</span>;
    }

    return (
      <div className="card">
        <div className="card-header"
              role="tab" id={"annotationHeader" + this.props.id}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}>
          <div className="d-flex justify-content-between">
            <div className="p-2" data-toggle="collapse" data-parent="#annotationAccordion"
              href={"#annotationBody" + this.props.id} 
              style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", cursor : "pointer"}}>
              <span className="badge px-2 mr-1" style={{backgroundColor: annotation_color, minHeight:"1.5rem"}}></span>
              <span>{this.props.category.name}</span>
            </div>
            <div className="p-2" style={align_center_style}>
              <div style={{display: this.state.target_id_editing? "flex": "none"}}>
                <input readOnly={!this.state.target_id_editing} type="text" className="form-control form-control-sm" placeholder="id" value={this.state.target_id} onChange={(e) => {this.onTargetIdChange(e)}} onKeyUp={(e) => {this.onTargetIdChange(e)}}/>
              </div>
              <span style={{display: this.state.target_id_editing? "none": "flex"}} onClick={()=>{this.setState({target_id_editing: !this.state.target_id_editing})}}>
                ({this.state.target_id})
              </span>
            </div>
            <div className="p-2">
              <div style={{display: this.state.action_editing? "flex": "none"}}>
                <input readOnly={!this.state.action_editing} type="text" className="form-control form-control-sm" placeholder="action..." value={this.state.action} onChange={(e) => {this.onActionChange(e)}} onKeyUp={(e) => {this.onActionChange(e)}}/>
              </div>
              <div className="dropdown" style={{display: this.state.action_editing? "none": "flex"}}>
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {(this.props.action || "none")}
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <a className="dropdown-item" href="#" onClick={(e) => {this.onActionClick(e)}}>Stand</a>
                  <a className="dropdown-item" href="#" onClick={(e) => {this.onActionClick(e)}}>Lie</a>
                  <a className="dropdown-item" href="#" onClick={(e) => {this.onActionClick(e)}}>Sit</a>
                  <a className="dropdown-item" href="#" onClick={(e) => {this.onActionClick(e)}}>Other</a>
                </div>
              </div>
            </div>
            <div className="p-2" style={align_center_style}>
              {na_keypoints_badge}
            </div>
            <div className="p-2">
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.onFocus}>Focus</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.onAnnotateNA}>Annotate N/A</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.onHideOthers}>Hide Others</button>
              </div>
            </div>
            <div className="p-2">
              {hiddenBadge}
              <button type="button" className="btn btn-sm btn-danger" onClick={this.deleteRequested}>Delete</button>
            </div>
          </div>
        </div>
        <div className="collapse" role="tabpanel" id={"annotationBody" + this.props.id}>
          <div className="card-block">
            <div className="row">
              <div className="col">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                        <th className="w-50"></th>
                        <th className="w-15">n/a</th>
                        <th className="w-15">occluded</th>
                        <th className="w-15">visible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keypointItems}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  }

}