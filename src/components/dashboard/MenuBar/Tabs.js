import React from "react";
import { Link } from "react-router-dom";

const Tabs = props => {
  let classNameRoute;
  let routeName = props.classNameRoute();
  if (routeName === "dashboardTrue") {
    classNameRoute = (
      <>
        <div className="col-md-1 active">
          <Link to={`/workspace/${props.workspaceId}/dashboard`}>Home</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/analysis`}>Analysis</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/projects`}>Projects</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/members`}>Members</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/reports`}>Reports</Link>
        </div>
      </>
    );
  } else if (routeName === "analysisTrue") {
    classNameRoute = (
      <>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/dashboard`}>Home</Link>
        </div>
        <div className="col-md-1 active">
          <Link to={`/workspace/${props.workspaceId}/analysis`}>Analysis</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/projects`}>Projects</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/members`}>Members</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/reports`}>Reports</Link>
        </div>
      </>
    );
  } else if (routeName === "projectsTrue") {
    classNameRoute = (
      <>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/dashboard`}>Home</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/analysis`}>Analysis</Link>
        </div>
        <div className="col-md-1 active">
          <Link to={`/workspace/${props.workspaceId}/projects`}>Projects</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/members`}>Members</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/reports`}>Reports</Link>
        </div>
      </>
    );
  } else if (routeName === "membersTrue") {
    classNameRoute = (
      <>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/dashboard`}>Home</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/analysis`}>Analysis</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/projects`}>Projects</Link>
        </div>
        <div className="col-md-1 active">
          <Link to={`/workspace/${props.workspaceId}/members`}>Members</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/reports`}>Reports</Link>
        </div>
      </>
    );
  } else if (routeName === 'reportsTrue') {
    classNameRoute = (
      <>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/dashboard`}>Home</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/analysis`}>Analysis</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/projects`}>Projects</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/members`}>Members</Link>
        </div>
        <div className="col-md-1 active">
          <Link to={`/workspace/${props.workspaceId}/reports`}>Reports</Link>
        </div>
      </>
    );
  } else {
    classNameRoute = (
      <>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/dashboard`}>Home</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/analysis`}>Analysis</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/projects`}>Projects</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/members`}>Members</Link>
        </div>
        <div className="col-md-1 analysis">
          <Link to={`/workspace/${props.workspaceId}/reports`}>Reports</Link>
        </div>
      </>
    );
  }
  return classNameRoute;
};

export default Tabs;
