import React, { Component } from 'react'
import { connect } from 'react-redux'
import { imageUpload } from '../store/image'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

class Upload extends Component {

  constructor(props) {
    super(props);
    this.state = {
      src: '',
      cropResult: null,
    };
    this.onChange = this.onChange.bind(this)
    this.saveToBucket = this.saveToBucket.bind(this)
    this.rotateLeft = this.rotateLeft.bind(this)
    this.rotateRight = this.rotateRight.bind(this)
  }

  onChange(e) {
    e.preventDefault()
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }
    const reader = new FileReader()
    reader.onload = () => {
      this.setState({ src: reader.result })
    };
    reader.readAsDataURL(files[0])
  }

  async saveToBucket () {
    await this.setState({
      cropResult: this.cropper.getCroppedCanvas({ maxWidth: 800, maxHeight: 800 }).toDataURL('image/jpeg', 0.75)
    })

    let request = {
      imageBinary: this.state.cropResult
    }
    this.props.imageUpload(request)
  }

  rotateLeft () {
    this.cropper.rotate(-90)
  }

  rotateRight () {
    this.cropper.rotate(90)
  }

  render() {
    return (
      <div>
        {/* We can style crop-container in media queries to set the width of the cropper!! */}
        <div id="crop-container" style={{ width: '80%', position: 'absolute', left: '10%' }}>
          <input type="file" onChange={this.onChange} />
          <button onClick={this.saveToBucket}>Use Crop</button>
          <button onClick={this.rotateLeft}>RL</button>
          <button onClick={this.rotateRight}>RR</button>
          <br />
          <br />
          <Cropper
            style={{ height: 500, width: '100%' }}
            aspectRatio={3 / 4}
            guides={false}
            src={this.state.src}
            ref={cropper => { this.cropper = cropper; }}
          />
        </div>
      </div>
    );
  }
}

const mapDispatch = dispatch => ({
  imageUpload: file => dispatch(imageUpload(file))
})

export default connect(null, mapDispatch)(Upload)