import React, { Component } from 'react'
import { connect } from 'react-redux'
import UploadImage from './UploadImage'
import { logout } from '../store/user'
import { Link } from 'react-router-dom'

class MyAccount extends Component {
	render() {
		const { user, isLoggedIn, handleClick, image } = this.props
		return (
			<div>
				<h1>Welcome, {user.userName}</h1>
				{Object.keys(image).length ? (
					<Link to="/game">
						<button>Play</button>
					</Link>
				) : (
					<UploadImage />
				)}

				{isLoggedIn && (
					<Link to="/" onClick={handleClick}>
						Logout
					</Link>
				)}
			</div>
		)
	}
}

const mapState = state => {
	return {
		user: state.user,
		isLoggedIn: !!state.user.id,
		image: state.image
	}
}

const mapDispatch = dispatch => {
	return {
		handleClick() {
			dispatch(logout())
		}
	}
}

export default connect(
	mapState,
	mapDispatch
)(MyAccount)