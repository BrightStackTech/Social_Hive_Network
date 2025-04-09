declare function AddTasksModule({ members, projectId, type, refreshFunc }: {
    members?: any[];
    projectId: string;
    type: string;
    refreshFunc: () => void;
}): import("react/jsx-runtime").JSX.Element;
export default AddTasksModule;
