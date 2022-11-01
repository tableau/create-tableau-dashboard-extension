import React from "react";
import { Button, Radio, Checkbox, TextField, DropdownSelect, TextLink } from '@tableau/tableau-ui';
import './Config.css';
import TableauHelper from './TableauHelper';

/* global tableau */

export class Config extends React.Component {

  constructor(props) {
    super(props);
    //  Set default config values 
    this.state = Object.assign(
      {
        worksheets: [],
        settingsLoaded: false
      },
      TableauHelper.defaultSettings()
    );

    //  Bind event handlers to `this`
    this.saveThenCloseDialog = this.saveThenCloseDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
  }

  //  Save settings, then close
  saveThenCloseDialog() {
    //  Save a reference to this component
    let thisComponent = this;

    //  Generate an object with just the settings to save
    let newState = {};
    for (let key in TableauHelper.defaultSettings()) {
      newState[key] = this.state[key];
    }

    //  Tell Tableau there are new settings for this extension
    TableauHelper.setSettings(newState);

    //  Save those settings (gets stored within the workbook xml)
    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      thisComponent.closeDialog()
    });
  }

  //  Trigger the popup to close
  closeDialog() {
    tableau.extensions.ui.closeDialog();
  }

  componentDidMount() {

    let thisComponent = this;

    //  Initialize the popup using tableau extension api
    tableau.extensions.initializeDialogAsync().then( () => {

      //  Look for any saved settings
      let newState = Object.assign(
        { 
          settingsLoaded: true,
          worksheets: TableauHelper.getWorksheets()
        },
        TableauHelper.getSettings()
      );

      //  Update the state
      thisComponent.setState(newState)

    })
  }

  //  HTML to render for this component
  render() {

    //  Get a reference to this component
    let thisComponent = this;

    //  Helper function to figure out which input was changed, and update the appropriate property of this component's state
    const updateStateDynamically = (e) => {
      const propName = e.target.attributes["stateprop"].value;
      let newStateValue = {};
      newStateValue[propName] = e.target.type==="checkbox" ? e.target.checked : e.target.value;
      thisComponent.setState(newStateValue)
    }

    //  Figure out which worksheet to mark as selected in the dropdown (default to an empty string)
    let selectedWorksheet = '';
    if (this.state.selectedWorksheet) {
      //  There is a saved selection, use that
      selectedWorksheet = this.state.selectedWorksheet;
    } else {
      if (this.state.worksheets.length>0) {
        //  No saved selection, so grab the first available worksheet
        selectedWorksheet = this.state.worksheets[0];
      }
    }

    //  Create menu items for worksheets dropdown
    const items = this.state.worksheets.map( (sheet, index) => {
      return <option value={sheet.name} key={index}>{sheet.name}</option> 
    })

    //  Render the output
    return (
      <div>
        <div className="tableau-titlebar">
          <span className="tableau-titlebar-label">Configure Extension</span>
          <span className="tableau-titlebar-close-button" onClick={this.closeDialog}>x</span>
        </div>
        <Radio checked={this.state.radio === 'one'} onChange={updateStateDynamically} name='ordinal' stateprop='radio' value='one'>One</Radio><br/>
        <Radio checked={this.state.radio === 'two'} onChange={updateStateDynamically} name='ordinal' stateprop='radio' value='two'>Two</Radio><br/>
        <br/>
        <Checkbox checked={this.state.checkbox} onChange={updateStateDynamically} stateprop='checkbox'>Checkbox</Checkbox><br/>
        <br/>
        <TextField label="Text field" stateprop="textField" value={this.state.textField} kind='line' onChange={updateStateDynamically} onClear={updateStateDynamically}/>
        <br/>
        <DropdownSelect label='Sheet' kind='line' onChange={updateStateDynamically} stateprop='selectedWorksheet' value={selectedWorksheet}>
           { items }
        </DropdownSelect>
        <br/>
        <div>
          <span>These UI components are from the </span>
          <TextLink kind='standalone' target='_blank' href='https://tableau.github.io/tableau-ui/'>TableauUI</TextLink> 
          <span> library</span>
        </div>
        <br/>
        <div className="tableau-footer">
          <Button kind="outline" key="cancelButton" onClick={this.closeDialog}>Cancel</Button>
          <Button kind="primary" key="saveButton" onClick={this.saveThenCloseDialog}>Save</Button>
        </div>
      </div>
    );
  }
}