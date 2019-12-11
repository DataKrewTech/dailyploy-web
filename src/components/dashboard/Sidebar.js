import React, { Component } from "react";
import AddWorkspaceModal from "./Sidebar/AddWorkspaceModal";
import SelectWorkspace from "./Sidebar/SelectWorkspace";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      setShow: false
    };
  }

  showTaskModal = () => {
    this.setState({
      setShow: true,
      show: true
    });
  };

  closeTaskModal = () => {
    this.setState({
      show: false
    });
  };

  nameSplit = name => {
    let nameArr = name;
    let nameSplit = nameArr.split(" ").slice(2);
    return nameSplit.join(" ");
  };

  nameFirstLetters = name => {
    let nameArr = this.nameSplit(name);
    let splitName = nameArr
      .split(" ")
      .slice(0, 2)
      .map(x => x[0])
      .join("");
    return splitName.toUpperCase();
  };

  render() {
    let workspacesArr = this.props.workspaces;
    let divideArr = workspacesArr.map(item => item);
    return (
      <>
        <div className="workspace-list">
          <ul>
            {divideArr.map((item, index) => (
              <SelectWorkspace
                item={item}
                index={index}
                key={index}
                nameFirstLetters={this.nameFirstLetters}
                nameSplit={this.nameSplit}
                workspaceId={this.props.workspaceId}
              />
            ))}
            <li>
              <div className="workspace-box" style={{ paddingTop: "8px" }}>
                <button className="btn btn-link" onClick={this.showTaskModal}>
                  +
                </button>
              </div>
              <div className="workspace-add-btn">Add New</div>
              <AddWorkspaceModal
                state={this.state}
                onHideModal={this.closeTaskModal}
              />
            </li>
          </ul>
        </div>
      </>
    );
  }
}

export default Sidebar;
