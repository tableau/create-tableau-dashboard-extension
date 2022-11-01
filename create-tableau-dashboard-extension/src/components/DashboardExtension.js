import React from "react";
import { Pill, TextLink } from '@tableau/tableau-ui';
import TableauHelper from './TableauHelper';

/* global tableau */

export class DashboardExtension extends React.Component {

  //  Look for any saved settings, set them to the state
  constructor(props) {
    super(props);
    //  Set default config values 
    this.state = Object.assign(
      {
        isSaving: false,
        settingsLoaded: false,
        dataTable: null
      },
      TableauHelper.defaultSettings()
    );
  }

  configureExtension() {

    let thisComponent = this;
    
    //  Determine the config popup's url
    const url = window.location.origin + "/config.html";
    
    //  Initialize the extension's config popup     
    tableau.extensions.ui.displayDialogAsync(url, "", { height: 500, width:400 } ).then((closePayload) => {
      thisComponent.setState(TableauHelper.getSettings());
    }).catch((error) => {
      // One expected error condition is when the popup is closed by the user (meaning the user
      // clicks the 'X' in the top right of the dialog).  This can be checked for like so:
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Config popup was closed by user");
          break;
        default:
          console.log(error.message);
      }
    });
  }

  //  Run when the component first mounts
  componentDidMount() {

    //  Save a reference to this
    let thisComponent = this;

    //  Function that takes the configuration settings, and fetches data from the specified worksheet
    const processData = async () => {
      
      //  Load any saved settings
      let settings = TableauHelper.getSettings();

      //  If a worksheet was specified in the config, fetch the dataTable for it
      if (settings.selectedWorksheet) {
        settings.dataTable = await TableauHelper.getData(settings.selectedWorksheet);
      }

      //  Update the state
      thisComponent.setState(settings);
    }

    //  Initialize the extension
    tableau.extensions.initializeAsync({"configure": this.configureExtension}).then(function () {

      processData();

      //  Watch for updates to settings
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        processData();
      });
    });
  }

  //  HTML to render for this component
   render() {

    //  Has the extension been configured?
    let content;
    if (this.state.dataTable) {
      const divStyle = { display: 'flex', overflowX: 'auto' }
      const pillStyle = { margin: '0 0.2em 0 0.2em', minWidth: '100px' };
      const textStyle = { marginTop: '0.25em' };
      content = <div style={divStyle}>
                  <span style={textStyle}>The worksheet </span>
                  <Pill kind='discrete' style={pillStyle}>{this.state.selectedWorksheet}</Pill>
                  <span style={textStyle}>has</span> 
                  <Pill kind='continuous' style={pillStyle}>{this.state.dataTable.totalRowCount} rows</Pill>
                  <span style={textStyle}>and</span> 
                  <Pill kind='continuous' style={pillStyle}>{this.state.dataTable.columns.length} columns</Pill>
                </div>
    } else {
      content = <div>This extension is not yet configured, <TextLink kind="standalone" onClick={this.configureExtension }>click here</TextLink> to setup.</div>
    }

    //  Render the output
    return  <div>
              { content }
            </div>
  }
}