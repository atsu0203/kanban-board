"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reducer = void 0;
var immer_1 = __importDefault(require("immer"));
var initialState = {
    filterValue: '',
};
exports.reducer = (0, immer_1.default)(function (draft, action) {
    switch (action.type) {
        case 'Filter.SetFilter': {
            var value = action.payload.value;
            draft.filterValue = value;
            return;
        }
    }
}, initialState);
