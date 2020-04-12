
import React from 'react';
import IdleTimer from 'react-idle-timer';
import $ from 'jquery';

import {FullEditView} from './full_edit.js'

export class FullEditListView extends React.Component {

    constructor(props) {
        super(props);
        let imagesAnnotated = []
        for(let i=0; i<props.images.length; i++){
            console.log(props.annotations[i]);
            if(props.annotations[i].length > 0){
                imagesAnnotated.push(
                    props.annotations[i][0].keypoints.length > 50? true: false);
            }else {
                imagesAnnotated.push(false);
            }
        }
        this.state = {
            imagesAnnotated : imagesAnnotated, 
            curImageIdInBatch : 1,
            maxImageIdInBatch : props.images.length,

            timeout:1000 * 60 * 30, //30 minutes
            showModal: false,
            isTimedOut: false
        };

        this.nextImage = this.nextImage.bind(this);
        this.pervImage = this.pervImage.bind(this);
        this.saveCurImageAnnotation = this.saveCurImageAnnotation.bind(this);

        this.idleTimer = null
        this.onAction = this._onAction.bind(this)
        this.onActive = this._onActive.bind(this)
        this.onIdle = this._onIdle.bind(this)
    }

    nextImage() {
        if(this.state.curImageIdInBatch < this.state.maxImageIdInBatch){
            this.setState({curImageIdInBatch: this.state.curImageIdInBatch + 1})
        }
    }

    pervImage() {
        if(this.state.curImageIdInBatch > 1){
            this.setState({curImageIdInBatch: this.state.curImageIdInBatch - 1})
        }
    }

    saveCurImageAnnotation() {
        console.log('saveCurImageAnnotation');
        let newImagesAnnotated = this.state.imagesAnnotated;
        newImagesAnnotated[this.state.curImageIdInBatch - 1] = true;
        this.setState({imagesAnnotated: newImagesAnnotated})

        var headers = new Headers();
        headers.set('Accept', 'application/json');
        var url = 'http://140.114.27.158.xip.io:9302/batch/save';
        var fetchOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                imagesAnnotated: this.state.imagesAnnotated
            })
        };
    
        fetch(url, fetchOptions).then(function(response) {
            return response.json();
        })
        .then(function(jsonData) {
            console.log(jsonData);
            
        });
    }

    _onAction(e) {
        console.log('user did something', e)
        this.setState({isTimedOut: false})
    }
     
    _onActive(e) {
        console.log('user is active', e)
        this.setState({isTimedOut: false})
    }
     
    _onIdle(e) {
        console.log('user is idle', e)
        const isTimedOut = this.state.isTimedOut
        if (isTimedOut) {
            // this.props.history.push('/')
            alert('閒置時間過久，請重新登入！');
            window.location = '/logout';
        } else {
          this.setState({showModal: true})
          this.idleTimer.reset();
          this.setState({isTimedOut: true})
        }
    }

    render() {
        return (
            <div>
                <IdleTimer
                    ref={ref => { this.idleTimer = ref }}
                    element={document}
                    onActive={this.onActive}
                    onIdle={this.onIdle}
                    onAction={this.onAction}
                    debounce={250}
                    timeout={this.state.timeout} />
                <FullEditView image={this.props.images[this.state.curImageIdInBatch - 1]}
                            annotations={this.props.annotations[this.state.curImageIdInBatch - 1]}
                            categories={this.props.categories}
                            saveCurImageAnnotation={this.saveCurImageAnnotation}/>
                <div className="fixed-top float-right" style={{backgroundColor: "white"}}>
                    <a href="#" onClick={() => {this.pervImage()}}>上一張圖</a>
                    <span className="mx-3">第{this.state.curImageIdInBatch}/{this.state.maxImageIdInBatch}張圖
                        ({this.state.imagesAnnotated[this.state.curImageIdInBatch-1]? "已儲存": "未儲存"})</span>
                    <a href="#" onClick={() => {this.nextImage()}}>下一張圖</a>
                    <a className="mx-2" href="http://140.114.27.158.xip.io:9302/dashboard">回首頁</a>
                </div>
            </div>
        );
    }

}