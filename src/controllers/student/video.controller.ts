import { Request, Response, NextFunction } from "express";
import { Vimeo } from "vimeo";

export default class VideoController {

  private client: Vimeo = new Vimeo('da32bec50562eb84efbec765e9b18b78ce1172f4', 'C1IQ5XJb/TlVE1UzqPYymhQ2HO3B19HnoqSUbvV7zaih55LmgBFxgCB9nsDT6GQ3UAG9nRQ9xrglX6uLr5NsVYyNZt8r88To+KZ5O920xR/Mr0USUpAhlxWQKDDPZLLl',
'e3a376751614f18b810a3c34b8b26121');

}