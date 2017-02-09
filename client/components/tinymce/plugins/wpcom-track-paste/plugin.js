/**
 * External dependencies
 */
import debugFactory from 'debug';
import tinymce from 'tinymce/tinymce';
import { recordTracksEvent } from 'state/analytics/actions';

const debug = debugFactory( 'calypso:tinymce-plugins:wpcom-paste-track' );

const SOURCE_GOOGLE_DOCS = 'google_docs';
const SOURCE_UNKNOWN = 'unknown';

function trackPaste( editor ) {
	debug( 'init' );

	const store = editor.getParam( 'redux_store' );
	if ( ! store ) {
		debug( 'store not found, do not bind events' );
		return;
	}

	/**
	 * Records the event.
	 *
	 * @param {String} mode - One of tinyMCE modes: 'html' or 'tinymce'.
	 * @param {String} types - A string containing the available types for the pasted content, separated by comma.
	 */
	function recordEvent( mode, types ) {
		debug( 'track paste event ' );
		store.dispatch( recordTracksEvent( 'calypso_editor_content_paste', { mode, types, source: getSource( types ) } ) );
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

	function toString( types ) {
		// types should be an array. Some browsers, as Firefox, return a DOMStringList instead.
		// We need coverage for thoses cases, hence the Array.from conversion.
		//
		// https://html.spec.whatwg.org/multipage/interaction.html#datatransfer
		// DOMStringListhttps://developer.mozilla.org/en-US/docs/Web/API/DOMStringList
		return Array.from( types ).join( ', ' );
	}

	function onPasteFromTinyMCEEditor( event ) {
		recordEvent( 'tinymce-editor', toString( event.clipboardData.types ) );
	}

	function onPasteFromHTMLEditor( event ) {
		recordEvent( 'html-editor', toString( event.clipboardData.types ) );
	}

	debug( 'bind listeners for paste event' );
	editor.on( 'paste', onPasteFromTinyMCEEditor );
	const textarea = editor.getParam( 'textarea' );
	if ( textarea ) {
		textarea.addEventListener( 'paste', onPasteFromHTMLEditor );
	}

	editor.on( 'remove', () => {
		debug( 'unbind listeners for paste event on editor removal' );
		editor.off( 'paste', onPasteFromTinyMCEEditor );
		textarea.removeEventListener( 'paste', onPasteFromHTMLEditor );
	} );
}

export default () => {
	debug( 'load' );
	tinymce.PluginManager.add( 'wpcom/trackpaste', trackPaste );
};
