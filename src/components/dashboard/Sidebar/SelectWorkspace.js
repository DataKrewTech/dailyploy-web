/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { workspaceNameSplit, firstTwoLetter } from "./../../../utils/function";
import ReactTooltip from "react-tooltip";

const SelectWorkspace = props => {
  if (props.item.id === Number(props.workspaceId)) {
    return (
      <li key={props.index}>
        <div className="workspace-box text-titlize active" title={workspaceNameSplit(props.workspaceName)}>
          <a
            //  className="btn btn-default"
            onClick={() => props.callWorkspace(props.item.id)}
            href=""
            title={workspaceNameSplit(props.workspaceName)}
            data-tip data-for="wname"
          >
            {firstTwoLetter(props.workspaceName)}

          </a>
          <ReactTooltip id="wname" place="top" effect="solid" style={{ zIndex: "998" }}>{props.workspaceName}</ReactTooltip>
        </div>
        <div className="workspace-text text-titlize">
          {workspaceNameSplit(props.workspaceName)}
        </div>
      </li>
    );
  } else {
    return (
      <li key={props.index}>
        <div className="workspace-box text-titlize" title={workspaceNameSplit(props.item.name)}>
          <a
            // className="btn btn-default"
            onClick={() => props.callWorkspace(props.item.id)}
            href=""
            title={workspaceNameSplit(props.item.name)}
          >
            {firstTwoLetter(props.item.name)}
            {}
          </a>
        </div>
        <div className="workspace-text text-titlize">
          {/* {workspaceNameSplit(props.item.name)} */}
        </div>
      </li>
    );
  }
};

export default SelectWorkspace;
