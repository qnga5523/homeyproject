import React from "react";
import { Link } from "react-router-dom";

import { Divider } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  GithubOutlined,
} from "@ant-design/icons";

export const Footer = () => {
  return (
    <footer className="bg-white/50 bg-opacity-40">
      <Divider className="bg-black mb-1 mt-0" />

      <div className="w-full py-6 lg:py-8">
        <div className="md:flex md:justify-between flex-col md:flex-row">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <Link className="flex items-center justify-center md:justify-start md:ml-48">
              {/* <img src={logomain} className="h-24" alt="Logo" /> */}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-4 text-center md:text-left md:mr-48">
            <div className="mb-6 md:mb-0">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Resources
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li>
                  <Link className="hover:underline">Ant Design</Link>
                </li>
                <li>
                  <Link className="hover:underline">Tailwind CSS</Link>
                </li>
              </ul>
            </div>
            <div className="mb-6 md:mb-0">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Follow us
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li>
                  <Link to=" " className="hover:underline ">
                    Github
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline">Discord</Link>
                </li>
              </ul>
            </div>
            <div className="mb-6 md:mb-0">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Legal
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li>
                  <Link className="hover:underline">Privacy Policy</Link>
                </li>
                <li>
                  <Link className="hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                Social
              </h2>
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-3">
                <Link className="text-gray-500 hover:text-gray-900">
                  <FacebookOutlined className="text-lg" />
                </Link>
                <Link className="text-gray-500 hover:text-gray-900">
                  <InstagramOutlined className="text-lg" />
                </Link>
                <Link className="text-gray-500 hover:text-gray-900">
                  <GithubOutlined className="text-lg" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
