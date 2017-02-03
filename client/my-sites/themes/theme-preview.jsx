/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { connectOptions } from './theme-options';
import { getThemeForPreviewData, getTheme } from 'state/themes/selectors';
import { getPreviewUrl } from 'my-sites/themes/helpers';
import { localize } from 'i18n-calypso';

export default function themePreview( WebPreview ) {
	const ThemePreview = React.createClass( {
		displayName: 'ThemePreview',

		propTypes: {
			theme: React.PropTypes.object,
			showPreview: React.PropTypes.bool,
			showExternal: React.PropTypes.bool,
			onClose: React.PropTypes.func,
			onPrimaryButtonClick: React.PropTypes.func,
			getPrimaryButtonHref: React.PropTypes.func,
			secondaryButtonLabel: React.PropTypes.string,
			onSecondaryButtonClick: React.PropTypes.func,
			getSecondaryButtonHref: React.PropTypes.func,
		},

		getDefaultProps() {
			return {
				onPrimaryButtonClick: noop,
				getPrimaryButtonHref: () => null,
				onSecondaryButtonClick: noop,
				getSecondaryButtonHref: () => null,
			};
		},

		onPrimaryButtonClick() {
			this.props.onPrimaryButtonClick( this.props.theme );
			this.props.onClose();
		},

		onSecondaryButtonClick() {
			this.props.onSecondaryButtonClick( this.props.theme );
			this.props.onClose();
		},

		getPrimaryOption() {
			const { translate } = this.props;
			const { purchase, activate, activateOnJetpack } = this.props.options;
			const { price } = this.props.theme;
			let primaryOption = activate || activateOnJetpack;
			if ( price && purchase ) {
				primaryOption = purchase;
				primaryOption.label = translate( 'Pick this design' );
			} else if ( activate ) {
				primaryOption = activate;
				primaryOption.label = translate( 'Activate this design' );
			}
			return primaryOption;
		},

		renderSecondaryButton() {
			if ( ! this.props.secondaryButtonLabel ) {
				return;
			}
			const buttonHref = this.props.getSecondaryButtonHref ? this.props.getSecondaryButtonHref( this.props.theme ) : null;
			return (
				<Button onClick={ this.onSecondaryButtonClick } href={ buttonHref } >
					{ this.props.secondaryButtonLabel }
				</Button>
			);
		},

		render() {
			const primaryOption = this.getPrimaryOption();
			const buttonHref = this.props.getPrimaryButtonHref ? this.props.getPrimaryButtonHref( this.props.theme ) : null;

			return (
				<WebPreview
					showPreview={ this.props.showPreview }
					showExternal={ this.props.showExternal }
					showSEO={ false }
					onClose={ this.props.onClose }
					previewUrl={ this.props.previewUrl } >
					{ this.renderSecondaryButton() }
					<Button primary onClick={ this.onPrimaryButtonClick } href={ buttonHref } >
						{ primaryOption.label }
					</Button>
				</WebPreview>
			);
		}
	} );

	const ConnectedThemePreview = connectOptions( ThemePreview );

	return connect(
		( state ) => {
			const themeData = getThemeForPreviewData( state );
			const theme = getTheme( state, themeData.siteId, themeData.themeId );
			return {
				theme,
				previewUrl: getPreviewUrl( theme ),
				options: [
					'activateOnJetpack',
					'preview',
					'tryAndCustomizeOnJetpack',
					'customize',
					'separator',
					'info',
					'support',
					'help',
				]
			};
		}
	)( localize( ConnectedThemePreview ) );
}
