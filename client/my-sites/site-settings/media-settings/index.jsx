/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormLabel from 'components/forms/form-label';
import FormCheckbox from 'components/forms/form-checkbox';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { protectForm } from 'lib/protect-form';
import { isJetpackModuleActive } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { updateSettings } from 'state/jetpack/settings/actions';

class MediaSettings extends Component {

	onInputChange = ( updated ) => {
		this.setState( updated );
		this.props.markChanged();
	}

	render() {
		const props = this.props;
		return (
			<Card className="media-settings site-settings">
				<FormFieldset>
					<div className="media-settings__info-link-container">
						<InfoPopover position={ 'left' }>
							<ExternalLink target="_blank" icon={ true } href={ 'https://jetpack.com/support/photon' } >
								{ props.translate( 'Learn more about Photon' ) }
							</ExternalLink>
						</InfoPopover>
					</div>
					<JetpackModuleToggle
						siteId={ props.siteId }
						moduleSlug="photon"
						label={ props.translate( 'Speed up your images and photos with Photon.' ) }
						description="Enabling Photon is required to use Tiled Galleries."
						disabled={ props.isRequestingSettings || props.isSavingSettings }
						/>
				</FormFieldset>
				<FormFieldset className="media-settings__formfieldset has-divider is-top-only">
					<div className="media-settings__info-link-container">
						<InfoPopover position={ 'left' }>
							<ExternalLink target="_blank" icon={ true } href={ 'https://jetpack.com/support/carousel' } >
								{ props.translate( 'Learn more about Carousel' ) }
							</ExternalLink>
						</InfoPopover>
					</div>
					<JetpackModuleToggle
						siteId={ props.siteId }
						moduleSlug="carousel"
						label={ props.translate( 'Transform image galleries into full screen slideshows.' ) }
						disabled={ props.isRequestingSettings || props.isSavingSettings }
						/>
					<div className="media-settings__module-settings is-indented">
						<FormLabel>
							<FormCheckbox
								name="carousel_display_exif"
								checked={ props.fields.carousel_display_exif || false }
								onChange={ props.handleToggle( 'carousel_display_exif' ) }
								disabled={ props.isRequestingSettings || props.isSavingSettings || ! props.carouselActive } />
							<span>{ props.translate( 'Show photo metadata (Exif) in carousel, when available' ) }</span>
						</FormLabel>
						<FormLabel htmlFor="carousel_background_color">
							{ props.translate( 'Background color' ) }
						</FormLabel>
						<FormSelect
							name="carousel_background_color"
							id="carousel_background_color"
							value={ props.fields.carousel_background_color || '' }
							onChange={ props.onChangeField( 'carousel_background_color' ) }
							disabled={ props.isRequestingSettings || props.isSavingSettings || ! props.carouselActive } >
							<option value={ 'black' } key={ 'carousel_background_color_black' }>
								{ props.translate( 'Black' ) }
							</option>
							<option value={ 'white' } key={ 'carousel_background_color_white' }>
								{ props.translate( 'White' ) }
							</option>
						</FormSelect>
					</div>
				</FormFieldset>
			</Card>
		);
	}
}

MediaSettings.propTypes = {
	carouselActive: PropTypes.bool.isRequired,
	isSavingSettings: PropTypes.bool
};

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		carouselActive: !! isJetpackModuleActive( state, selectedSiteId, 'carousel' )
	};
};

export default connect(
	mapStateToProps,
	{
		updateSettings
	}
)( localize( protectForm( MediaSettings ) ) );
