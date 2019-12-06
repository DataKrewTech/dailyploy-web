import React, { Component } from "react";

class DailyPloySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "",
      suggestions: [],
      searchText: "",
      isBorder: false,
      show: false,
      canBack: false,
      border: "solid 1px #d1d1d1",
      color: "#d1d1d1",
      notFound: "hide",
    };
  }

  componentDidMount = () => {
    this.setState({
      suggestions: this.props.options ? this.props.options : [],
      selected: this.props.default ? this.props.default : ""
    })
  }

  onClickInput = () => {
    this.setState({ show: !this.state.show, suggestions: this.props.options })
  }

  onSearchTextChange = (e) => {
    const value = e.target.value
    const searchBy = this.props.searchBy ? this.props.searchBy : "name"
    let suggestions = []
    if (value.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      suggestions = this.props.options.filter(s => regex.test(`${s[searchBy]}`))
    } else {
      suggestions = this.props.options
    }
    this.setState({
      suggestions: suggestions,
      searchText: value,
      show: true,
      notFound: suggestions.length > 0 ? "hide" : "show",
    });
  }

  renderSearchSuggestions = () => {
    const klass = this.props.iconType == "block" ? "color-block" : this.props.iconType == "circle" ? "color-dot" : ""
    const name = this.props.suggesionBy ? this.props.suggesionBy : "name"
    return (
      <>
        {this.state.suggestions.length > 0 ?
          <ul>
            {klass != "" ? this.state.suggestions.map((option, idx) => {
              return (
                <li key={idx} onClick={() => this.selectSuggestion(option)}>
                  <div
                    className={`d-inline-block ${klass}`}
                    style={{ backgroundColor: `${option.color_code}` }}></div>
                  <span className="d-inline-block right-left-space-5 text-titlize">{`${option[name]}`}</span>
                </li>
              )
            }) :
              this.state.suggestions.map((option, idx) => {
                return (
                  <li key={idx} onClick={() => this.selectSuggestion(option)}>
                    <span className="d-inline-block right-left-space-5 text-titlize">{`${option[name]}`}</span>
                  </li>
                )
              })}
          </ul>
          : null}
        < span className={`text-titlize left-padding-20px  ${this.state.notFound}`} >No Match Found</span>
      </>
    )
  }

  renderSelectedSuggestion = () => {
    const selected = this.state.selected
    const klass = this.props.iconType == "block" ? "color-block" : this.props.iconType == "circle" ? "color-dot" : ""
    const label = this.props.label ? this.props.label : "name"
    return (
      <>
        {selected != "" ?
          <div className="">
            <div className={`d-inline-block ${klass}`} style={{ backgroundColor: `${selected.color_code ? selected.color_code : this.state.color}` }}></div>
            <div className="right-left-space-5 d-inline-block">{`${selected[label]}`}</div>
          </div>
          : null}
      </>
    )
  }

  selectSuggestion = (option) => {
    this.setState({ selected: option, show: false, searchText: "" })
    this.props.onChange(option)
  }

  handleBackSpace = (event) => {
    if (event.keyCode === 8 && this.state.searchText.length === 0) {
      this.setState({
        canBack: true,
        selected: "",
        suggestions: this.props.options
      })
      this.props.onChange(null)
    }
  }

  render() {
    const { props } = this;
    return (
      <>
        <div className={`col-md-12  d-inline-block no-padding ${props.className ? props.className : ""}`}>
          <div className=" custom-search-select">
            <div onClick={this.onClickInput}>
              <div className="d-inline-block selected-tags text-titlize">
                {this.renderSelectedSuggestion()}
              </div>
              <input className="d-inline-block"
                type="text" value={this.state.searchText}
                placeholder={`${this.state.selected ? "" : props.placeholder ? props.placeholder : ""}`}
                onChange={this.onSearchTextChange}
                onKeyUp={this.handleBackSpace}
              />
              {this.state.show ?
                <div className="suggestions" >
                  {this.renderSearchSuggestions()}
                </div>
                : null}
              <span className="down-icon"><i className="fa fa-angle-down"></i></span>
            </div>

          </div>
        </div>
      </>
    );
  }
};

export default DailyPloySelect;


{/* <DailyPloySelect
  options={this.props.projects}
  placeholder="select"
  label="name"
  className=""
  searchBy="name"
  suggesionBy="name"
  iconType="circle"
  iconType="block"
  name="taskName"
  onChange={() => { }}
/> */}