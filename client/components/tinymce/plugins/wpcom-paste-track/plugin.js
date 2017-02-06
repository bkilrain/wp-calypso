/**
 * External dependencies
 */
import analytics from 'lib/analytics';
import tinymce from 'tinymce/tinymce';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:tinymce-plugins:wpcom-paste-track' );

function pasteTrack( editor ) {
	debug( 'init' );

	/**
	 * Records the event.
	 *
	 * @param {Array} types - An array containing the available types for the pasted content.
	 * @param {String} mode - One of tinyMCE modes, 'html' or 'tinymce'.
	 */
	function recordEvent( types, mode ) {
		debug( 'track paste event ' );
		analytics.tracks.recordEvent( 'calypso_editor_content_paste', {
			types: types,
			mode: mode,
			is_gdocs: isGoogleDocsType( types )
		} );
	}

	function isGoogleDocsType( types ) {
		return ( types.indexOf( 'application/x-vnd.google-docs-image-clip+wrapped' ) > -1 ) ||
		( types.indexOf( 'application/x-vnd.google-docs-document-slice-clip+wrapped' ) > -1 );
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
