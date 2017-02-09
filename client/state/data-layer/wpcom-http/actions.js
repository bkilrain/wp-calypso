/**
 * Internal dependencies
 */
import {
	WPCOM_HTTP_REQUEST,
	WPCOM_HTTP_BAD_REQUEST,
} from 'state/action-types';

const badRequest = () => ( {
	type: WPCOM_HTTP_BAD_REQUEST,
	error: 'request parameters object is not valid'
} );

/**
 * Returns a valid WordPress.com API HTTP Request action object
 *
 * @param {string} [apiVersion] specific API version for request
 * @param {string} [apiNamespace] specific API namespace for request
 * @param {Object} [body] JSON-serializable body for POST requests
 * @param {string} method name of HTTP method to use
 * @param {string} path WordPress.com API path with %s and %d placeholders, e.g. /sites/%s
 * @param {Object} [query] key/value pairs for query string
 * @param {FormData} [formData] key/value pairs for POST body, encoded as "multipart/form-data"
 * @param {Object} [onSuccess] Redux action to call when request succeeds
 * @param {Object} [onFailure] Redux action to call when request fails
 * @param {Object} [onProgress] Redux action to call on progress events from an upload
 * @param {Object} [options] extra options to send to the middleware, e.g. retry policy or offline policy
 * @param {Object} [action] default action to call on HTTP events
 * @return {Object} Redux action describing WordPress.com API HTTP request
 */
export const http = ( {
	apiVersion,
	apiNamespace,
	body = {},
	method,
	path,
	query = {},
	formData,
	onSuccess,
	onFailure,
	onProgress,
	...options,
}, action = null ) => {
	const actionProperties = {
		onSuccess: onSuccess || action,
		onFailure: onFailure || action,
		onProgress: onProgress || action,
		query: { ...query }
	};

	// * check parameters *

	// `path` is not optional and it is a string
	// `method` is not optional and its value can take either 'GET' or 'POST`
	if (
		( ! path || typeof path !== 'string' ) ||
		( ! method || ( method !== 'GET' && method !== 'POST' ) )
	) {
		return badRequest();
	}

	// - One of `apiVersion` of `apiNamespace` should be defined
	// - `apiVersion` and `apiNamespace` cannot be defined simultaneously
	if (
		( typeof apiVersion === 'undefined' && typeof apiNamespace === 'undefined' ) ||
		( typeof apiVersion !== 'undefined' && typeof apiNamespace !== 'undefined' )
	) {
		return badRequest();
	}

	// - `apiVersion` must have the `v1, v2, ...` shape
	if ( typeof apiVersion !== 'undefined' && ( /^v\d+/ ).test( apiVersion ) ) {
		actionProperties.query.apiVersion = apiVersion;
	}

	// - `apiNamesapce` must have the `wp/v2, wpcom/v2, ...` shape
	if ( typeof apiNamespace !== 'undefined' && ( /^[a-z]+\/v\d+/ ).test( apiNamespace ) ) {
		actionProperties.query.apiNamespace = apiNamespace;
	}

	return {
		...actionProperties,
		type: WPCOM_HTTP_REQUEST,
		path,
		method,
		body,
	};
};
