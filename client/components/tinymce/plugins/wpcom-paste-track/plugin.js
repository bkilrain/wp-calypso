/**
 * External dependencies
 */
import debugFactory from 'debug';
import tinymce from 'tinymce/tinymce';
import { recordTracksEvent } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:tinymce-plugins:wpcom-paste-track' );

const SOURCE_GOOGLE_DOCS = 'google_docs';
const SOURCE_UNKNOWN = 'unknown';

function pasteTrack( editor ) {
	debug( 'init' );

	const store = editor.getParam( 'redux_store' );
	if ( ! store ) {
		debug( 'store not found, do not bind events' );
		return;
	}

	/**
	 * Records the event.
	 *
	 * @param {String} types - A string containing the available types for the pasted content, separated by comma.
	 * @param {String} mode - One of tinyMCE modes: 'html' or 'tinymce'.
	 */
	function recordEvent( types, mode ) {
		debug( 'track paste event ' );
		store.dispatch( recordTracksEvent( 'calypso_editor_content_paste', {
			types: types,
			mode: mode,
			source: getSource( types ) // for visualising purposes, group types into known sources
		} ) );
	}

	function isGoogleDocs( types ) {
		return ( types.indexOf( 'application/x-vnd.google-docs-image-clip+wrapped' ) > -1 ) ||
		( types.indexOf( 'application/x-vnd.google-docs-document-slice-clip+wrapped' ) > -1 );
	}

	function getSource( types ) {
		if ( isGoogleDocs( types ) ) {
			return SOURCE_GOOGLE_DOCS;
		}
		return SOURCE_UNKNOWN;
	}

	function flattenArray( orgTypes ) {
		// As per https://html.spec.whatwg.org/multipage/interaction.html#datatransfer
		// types should be an array containing the available formats that were set on copy.
		// Some browsers, as Firefox, return a DOMStringList instead, see
		// https://developer.mozilla.org/en-US/docs/Web/API/DOMStringList
		let types = [];
		if ( orgTypes.contains ) {
			types = Array.from( orgTypes );
		} else {
			types = orgTypes.slice();
		}
		return types.reduce( ( a, b ) => {
			return a + ', ' + b;
		} );
	}

	function onPasteEditor( event ) {
		recordEvent( flattenArray( event.clipboardData.types ), 'tinymce' );
	}

	function onPasteTextArea( event ) {
		recordEvent( flattenArray( event.clipboardData.types ), 'html' );
	}

	// Bind paste event listeners to both Visual and HTML editors
	editor.on( 'paste', onPasteEditor );
	const textarea = editor.getParam( 'textarea' );
	if ( textarea ) {
		textarea.addEventListener( 'paste', onPasteTextArea );
	}
}

export default () => {
	debug( 'load' );
	tinymce.PluginManager.add( 'wpcom/pastetrack', pasteTrack );
};
