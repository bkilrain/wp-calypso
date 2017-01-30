/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Timezone from 'blocks/timezone';
import Card from 'components/card';

class TimezoneExample extends PureComponent {
	constructor() {
		super( ...arguments );
		this.state = {
			timezone: 'America/Argentina/La_Rioja'
		};
	}

	setTimezone = ( timezone ) => {
		this.setState( { timezone } );
	}

	render() {
		return (
			<Card style={ { width: '300px', height: '350px', margin: 0 } }>
				<Timezone
					selectedZone={ this.state.timezone }
					onSelect={ this.setTimezone }
				/>
			</Card>
		);
	}
}

export default TimezoneExample;
