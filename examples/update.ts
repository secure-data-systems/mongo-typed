/* eslint-disable @typescript-eslint/no-unused-vars */
import { Update } from '../src/index.js';

interface Comment {
	_id: string,
	likes: number,
	text: string
}

interface Post {
	_id: string,
	comments: Comment[],
	content: string,
	createdAt: Date,
	published: boolean,
	tags: string[],
	title: string,
	views: number
}

const updatePost: Update<Post> = {
	$currentDate: {
		createdAt: true
	},

	$inc: {
		'comments.1.likes': 5,
		'views': 1
	},

	$pull: {
		comments: {
			likes: { $lte: -10 }
		},
		tags: { $in: ['deprecated', 'old'] }
	},

	$push: {
		comments: {
			$each: [
				{ _id: 'c3', likes: 0, text: 'New comment' }
			],
			$slice: 10,
			$sort: { likes: -1 }
		},
		tags: {
			$each: ['typescript', 'mongodb'],
			$position: 0
		}
	},

	$rename: {
		'title': 'headline'
	},

	$set: {
		'comments.0.text': 'Updated comment text',
		'title': 'Updated Title'
	},

	$unset: {
		content: 1
	}
};
